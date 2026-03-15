import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { useGameStore } from '../store/useGameStore';
import type { NetworkAction, GameState } from '../types/game';

interface NetworkContextType {
  connectToHost: (targetHostId: string) => void;
  broadcast: (action: NetworkAction) => void;
  sendToHost: (action: NetworkAction) => void;
  syncFullState: () => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    playerId, playerName, hostId, setGameState, setNetworkStatus 
  } = useGameStore();
  
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Record<string, DataConnection>>({});
  const joinIntervalRef = useRef<number | null>(null);

  // Helper to ensure state is clean JSON for PeerJS
  const getCleanState = () => {
    const state = useGameStore.getState();
    return JSON.parse(JSON.stringify({
      players: state.players,
      hostId: state.hostId,
      currentMeme: state.currentMeme,
      captionCards: state.captionCards,
      hands: state.hands,
      submittedCaptions: state.submittedCaptions,
      judgeId: state.judgeId,
      phase: state.phase,
      winner: state.winner
    }));
  };

  const broadcast = useCallback((action: NetworkAction) => {
    // If it's a SYNC_STATE, ensure it's clean JSON (no functions/symbols)
    const message = action.type === 'SYNC_STATE' 
      ? { type: 'SYNC_STATE', state: JSON.parse(JSON.stringify(action.state)) }
      : action;

    console.log(`[Network] Broadcasting: ${message.type}`);
    Object.entries(connectionsRef.current).forEach(([id, conn]) => {
      if (conn.open) {
        conn.send(message);
      } else {
        console.warn(`[Network] Connection to ${id} closed, removing.`);
        delete connectionsRef.current[id];
      }
    });
  }, []);

  const syncFullState = useCallback(() => {
    const cleanState = getCleanState();
    broadcast({ type: 'SYNC_STATE', state: cleanState });
  }, [broadcast]);

  const handleData = useCallback((action: NetworkAction, from: string) => {
    const isHost = useGameStore.getState().playerId === useGameStore.getState().hostId;
    console.log(`[Network] MSG: ${action.type} from ${from}`);

    if (action.type === 'SYNC_STATE') {
      console.log('[Network] SYNC_STATE Received. Updating...');
      setGameState(action.state);
      setNetworkStatus('CONNECTED');
      // Stop the join retry interval if we're the client
      if (joinIntervalRef.current) {
        clearInterval(joinIntervalRef.current);
        joinIntervalRef.current = null;
      }
    } else if (action.type === 'JOIN_GAME' && isHost) {
      const state = useGameStore.getState();
      const exists = state.players.find(p => p.id === action.playerId);
      let nextPlayers = state.players;
      
      if (!exists) {
        nextPlayers = [...state.players, { id: action.playerId, name: action.name, score: 0 }];
        setGameState({ players: nextPlayers });
      }
      
      // Host ALWAYS broadcasts full state sync to everyone when anyone joins
      syncFullState();
    } else if (isHost) {
      // Logic for SUBMIT_CAPTION, PICK_WINNER etc
      const currentState = useGameStore.getState();
      let nextState: Partial<GameState> = {};
      
      if (action.type === 'SUBMIT_CAPTION') {
        const newSubs = [...currentState.submittedCaptions, { playerId: action.playerId, text: action.text }];
        nextState = { 
          submittedCaptions: newSubs,
          phase: newSubs.length >= (currentState.players.length - 1) ? 'JUDGING' : currentState.phase
        };
      } else if (action.type === 'PICK_WINNER') {
        nextState = {
          phase: 'RESOLUTION',
          winner: action.winnerId,
          players: currentState.players.map(p => p.id === action.winnerId ? { ...p, score: p.score + 1 } : p)
        };
      }

      if (Object.keys(nextState).length > 0) {
        setGameState(nextState);
        syncFullState();
      }
    }
  }, [setGameState, setNetworkStatus, syncFullState]);

  const sendToHost = useCallback((action: NetworkAction) => {
    const state = useGameStore.getState();
    if (state.playerId === state.hostId) {
      // If we are the host, process it locally
      console.log('[Network] Host processing local action:', action.type);
      handleData(action, state.playerId);
    } else {
      const hostConn = connectionsRef.current[hostId!];
      if (hostConn?.open) {
        console.log(`[Network] Sending to host: ${action.type}`);
        hostConn.send(action);
      } else {
        console.warn('[Network] Cannot send to host: connection not open');
      }
    }
  }, [hostId, handleData]);

  useEffect(() => {
    if (!playerId || peerRef.current) return;

    const peer = new Peer(playerId, { debug: 1 });
    peerRef.current = peer;

    peer.on('open', (id) => {
      setNetworkStatus(id === hostId ? 'CONNECTED' : 'CONNECTING');
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        connectionsRef.current[conn.peer] = conn;
        if (useGameStore.getState().playerId === useGameStore.getState().hostId) {
          conn.send({ type: 'SYNC_STATE', state: getCleanState() });
        }
      });
      conn.on('data', (data) => handleData(data as NetworkAction, conn.peer));
      conn.on('close', () => delete connectionsRef.current[conn.peer]);
    });

    return () => {
      peer.destroy();
      peerRef.current = null;
    };
  }, [playerId, hostId, handleData, setNetworkStatus]);

  const connectToHost = useCallback((targetHostId: string) => {
    if (!peerRef.current || !playerId) return;

    const startSession = () => {
      console.log('[Network] Starting session with host:', targetHostId);
      const conn = peerRef.current!.connect(targetHostId, { reliable: true });
      
      conn.on('open', () => {
        connectionsRef.current[targetHostId] = conn;
        
        // HEARTBEAT JOIN: Keep sending join until we get a SYNC_STATE
        if (joinIntervalRef.current) clearInterval(joinIntervalRef.current);
        
        const sendJoin = () => {
          if (conn.open) {
            console.log('[Client] Sending persistent JOIN_GAME...');
            conn.send({ type: 'JOIN_GAME', name: playerName || 'Guest', playerId });
          }
        };

        sendJoin();
        joinIntervalRef.current = window.setInterval(sendJoin, 2000);
      });

      conn.on('data', (data) => handleData(data as NetworkAction, targetHostId));
      conn.on('close', () => {
        setNetworkStatus('DISCONNECTED');
        if (joinIntervalRef.current) clearInterval(joinIntervalRef.current);
      });
    };

    if (peerRef.current.open) startSession();
    else peerRef.current.once('open', startSession);
  }, [playerId, playerName, handleData, setNetworkStatus]);

  return (
    <NetworkContext.Provider value={{ connectToHost, broadcast, sendToHost, syncFullState }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within NetworkProvider');
  return context;
};
