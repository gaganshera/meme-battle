# What Do You Meme? - Developer Guide

This is a front-end only, multiplayer version of the popular party game "What Do You Meme?". It uses Peer-to-Peer (WebRTC) networking to allow multiple players to join a session without a dedicated backend.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Styling:** [TailwindCSS 4](https://tailwindcss.com/)
- **Networking:** [PeerJS](https://peerjs.com/) (WebRTC)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🏗️ Architecture

### P2P Networking (`src/context/NetworkContext.tsx`)
The app operates on a **Host/Client** model via WebRTC:
- **Host:** The player who creates the room. The Host browser acts as the "Server of Truth", maintaining the master game state in its local storage and broadcasting updates to all connected peers.
- **Clients:** Players who join via a Room Code. They send their actions (submitting a card, etc.) to the Host, which processes them and syncs the result back to everyone.
- **Signaling:** Uses the public PeerJS cloud server to exchange connection metadata (SDP/ICE) so peers can find each other.

### Game State (`src/store/useGameStore.ts`)
Managed by Zustand. The store is synced across all clients using a `SYNC_STATE` network action. To prevent issues with WebRTC, the state is "cleaned" (serialized to pure JSON) before transmission.

### Meme API (`src/hooks/useGameLogic.ts`)
Fetches the Top 100 popular blank meme templates from the [Imgflip API](https://api.imgflip.com/get_memes) at the start of each round.

## 🎮 Game Flow

1. **Lobby:** Players join using a 6-character alphanumeric Room Code (e.g., `8X2P9L`).
2. **Submission:** A random meme template is shown. All players except the rotating "Judge" select the funniest caption from their hand of 7 cards.
3. **Judging:** The Judge views all submitted captions anonymously and selects a winner.
4. **Resolution:** Points are awarded, the winner is celebrated, and the Host can start the next round.

## 🛠️ Getting Started

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
To expose the app to your local network (e.g., for testing on mobile devices):
```bash
npm run dev -- --host
```

### Building for Production
```bash
npm run build
```

## 🧪 Testing

Since the app is P2P, testing requires at least two "players":
1. Open [http://localhost:5173/](http://localhost:5173/) in Tab A (Host).
2. Create a room and copy the Room Code.
3. Open [http://localhost:5173/](http://localhost:5173/) in Tab B (Player).
4. Enter a different name and the Room Code from Tab A.
5. Verify both tabs show each other in the "Squadron" list.

## ⚠️ Troubleshooting

- **"Joining Battle Station..." stuck:** If a client doesn't sync within 5 seconds, a "Retry" button appears. This re-triggers the `JOIN_GAME` handshake.
- **WebSocket Errors:** Often caused by strict corporate firewalls or VPNs blocking WebRTC/STUN/TURN. Try disabling VPN or testing on a different network.
- **Judge click does nothing:** Ensure the Host is the one processing the action. We use a local loopback in `NetworkContext` to handle cases where the Host is the active Judge.

## 📝 Rules & Content
- **Caption Cards:** Stored in `src/data/captions.json`.
- **Game Logic:** Centralized in `src/hooks/useGameLogic.ts`.
