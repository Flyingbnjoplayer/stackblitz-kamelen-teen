# 🎨 Glitch NFT Studio

A retro-style photo editing app that lets you create glitch art and mint it as NFTs on the Base network.

## ✨ Features

- **Glitch Effects**: Apply retro glitch effects to your images with customizable intensity
- **NFT Minting**: Mint your artwork as NFTs on the Base network using OnchainKit
- **Social Sharing**: Share your creations on Farcaster and Based
- **Wallet Integration**: View your wallet balance and connected address
- **Download Artwork**: Save your glitch art to your device
- **Farcaster Mini-App**: Fully integrated as a Farcaster Mini App

## 🚀 Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type-safe development
- **OnchainKit** - Base network integration
- **Farcaster Mini-App SDK** - Native Farcaster integration
- **Vercel Blob** - Image storage
- **Tailwind CSS** - Styling

## 🛠️ Setup

### Prerequisites

- Node.js 18+ installed
- A Vercel account
- A Farcaster account (for mini-app features)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd glitch-nft-studio
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
   - See `SETUP_GUIDE.md` for detailed instructions on configuring Vercel Blob storage

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Documentation

For detailed setup instructions, including:
- Creating a Vercel account
- Deploying to Vercel
- Configuring Blob storage
- Troubleshooting common issues

Please refer to [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🎯 Usage

1. **Upload an Image**: Click the upload area or drag and drop an image
2. **Apply Glitch Effect**: Use the intensity slider to adjust the glitch effect
3. **Mint as NFT**: Connect your wallet and mint your artwork on Base
4. **Share**: Share your creation on Farcaster or Based
5. **Download**: Save your glitch art to your device

## 🌐 Deployment

This app is designed to be deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you encounter any issues, please report them on the [Issues](../../issues) page.

## 🙏 Acknowledgments

- Built with [OnchainKit](https://onchainkit.xyz/)
- Powered by [Farcaster](https://www.farcaster.xyz/)
- Deployed on [Vercel](https://vercel.com/)
- Base network by [Coinbase](https://base.org/)
