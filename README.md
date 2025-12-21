# StreamSprout

**Empower Your Streams with StreamSprout: The Ultimate Data-Driven Toolkit for Streamers and Content Creators**

## 🖼️ Screenshots & Release Status

[Updates](https://devpost.com/software/streamsprout#updates)

[Try it out](https://kvnbbg.github.io/StreamSprout/)

## 🖼️ Description

![StreamSprout Image](image.jpg)

[![Latest Release](https://img.shields.io/github/v/release/Kvnbbg/StreamSprout)](https://github.com/Kvnbbg/StreamSprout/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Devpost Project](https://img.shields.io/badge/Devpost-StreamSprout-brightgreen)](https://devpost.com/software/streamsprout#updates)
[![Built with Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)

**StreamSprout** is a data-driven toolkit designed for streamers and content creators, utilizing Amazon Bedrock's generative AI capabilities to optimize viewer engagement, analyze performance, and monetize streaming content like never before.

## 🌟 Key Features

- **Real-Time Viewer Analytics**: Monitor engagement metrics, retention rates, and viewer behavior to fine-tune your content strategy.
- **AI-Powered Audience Interaction**: Use intelligent chatbots for interactive live polls, Q&A sessions, and personalized viewer messages.
- **Integrated Monetization Tools**: Seamlessly set up donations, subscriptions, and merchandise sales with real-time tracking.
- **Community Management Suite**: Manage your social media presence and audience interactions from a single platform.
- **Content Optimization Engine**: Leverage AI to generate content ideas based on trends, viewer preferences, and competitive analysis.
- **Esports Insights**: Integrated VALORANT esports data to help analyze player performance and make strategic recruitment decisions.

## 🚀 Quick Start

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Kvnbbg/StreamSprout.git
   ```

2. **Install Dependencies**:
   ```bash
   cd StreamSprout
   npm install
   ```

3. **Setup Configuration**:
   - Create a `.env` file in the root directory with the following environment variables:
     ```
     # PostgreSQL (either provide DATABASE_URL or the individual DB_* fields below)
     DATABASE_URL=postgres://user:password@localhost:5432/valort_db
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_HOST=localhost
     DB_NAME=valort_db
     DB_PORT=5432

     # Amazon Bedrock proxy credentials
     BEDROCK_API_KEY=your_bedrock_api_key
     BEDROCK_API_ENDPOINT=https://your-bedrock-endpoint
     ```

### Running the Application

```bash
npm start
```

The Express server serves the static UI from `public/` and exposes the API routes
documented in `server/index.js`.

## 📦 Project Layout (clarifying the stack)

- **Backend (Node/Express)**: `server/index.js` connects to PostgreSQL and exposes `/players`, `/ask`,
  and related routes.
- **Frontend (static HTML/CSS/JS)**: `public/index.html` plus `styles.css` and `script.js`.
- **Java/Spring sample (not wired to build)**: `POM.xml` and `TensorFlowLlmApplication.java` are
  experimental artifacts and are not used by the Node server.

### Development Stack

- **Frontend**: Static HTML/CSS/JavaScript served from `public/`.
- **Backend**: Node.js + Express with PostgreSQL.
- **AI Integration**: Amazon Bedrock proxy endpoint for LLM responses.

## 🤝 Contributing

We welcome your contributions to enhance StreamSprout! Here’s how you can get involved:

1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feature/new-feature`)
3. **Commit Your Changes** (`git commit -m 'Add a new feature'`)
4. **Push to the Branch** (`git push origin feature/new-feature`)
5. **Open a Pull Request** for code review and integration

## 📄 License

This project is licensed under the MIT License. See the [`LICENSE`](LICENSE) file for more details.

## 📞 Support & Collab

![Kevin Marville Image](collaborator-image-1.jpg)

https://www.linkedin.com/in/kevin-marville/


Feel free to reach out with any questions, feedback, or collaboration requests! We’re excited to help you grow your streaming community.
