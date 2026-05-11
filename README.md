# 🧿 CultOS: Viral Consensus Architect

**CultOS** is a decentralized "cult-as-a-service" platform built on the Stacks blockchain. It leverages generative AI to manifest viral consensus layers (tokens) by synthesizing lore, branding, and economic blueprints directly from the cultural zeitgeist.

![License](https://img.shields.io/badge/license-MIT-purple)
![Stacks](https://img.shields.io/badge/chain-Stacks-orange)
![AI](https://img.shields.io/badge/AI-Gemini-blue)

---

## ⚡ The Vision
Traditional token launches lack soul. CultOS replaces generic whitepapers with "AI-Generated Manifestos," using LLMs to craft deep lore, viral slogans, and risk-calibrated tokenomics. It’s not just a token; it’s a movement.

## 🛠 Features

- **Neural Cult Sequencer**: Guided AI generation for token names, symbols, and lore based on user themes.
- **Visual Identity Synthesis**: Integrated image generation (Gemini) or manual asset upload for token logos.
- **Stacks Integration**: Real-time STX balance tracking and wallet authentication via Hiro API.
- **Degen Analytics**: AI-derived Risk Factor, Viral Score, and Market Sentiment analysis.
- **One-Click Manifestation**: Simulated deployment logic requiring 0.1 STX to "bridge" the cult to the network.

## 🚀 Tech Stack

- **Core**: React 18 + Vite + TypeScript
- **Intelligence**: Gemini Pro (Manifesto/Lore) & Gemini Image API (Logos)
- **Blockchain**: `@stacks/connect` + `@stacks/network` (Leather/Xverse support)
- **Data**: Hiro API (Mainnet balance tracking)
- **Motion**: Framer Motion + Canvas Confetti
- **Styling**: Tailwind CSS + Cyberpunk Terminal Aesthetic

## 📦 Getting Started

### Prerequisites
- [Leather Wallet](https://leather.io/) or [Xverse](https://www.xverse.app/) installed.
- Node.js 18+

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   Create a `.env` file with your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔒 Security & Architecture
- **Private Keys**: Authentication is handled entirely client-side via Stacks Connect. Private keys never leave your wallet.
- **Integrity**: All cult data is synthesized in real-time; generated assets are formatted as standard Stacks token templates.

---

*Manifested for the open web. Use at your own risk. The cult is watching.*
