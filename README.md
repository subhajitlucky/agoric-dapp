# Decentralized Scholarship Ledger: Empowering Rural Education

The **Decentralized Scholarship Ledger** is a blockchain-based application built on the [Agoric smart contract platform](https://docs.agoric.com/). It aims to streamline and secure the process of scholarship disbursement for rural kids. The platform ensures transparency, accountability, and accessibility, eliminating intermediaries while fostering trust among stakeholders. 

Users can explore available scholarships, apply for them with ease, and track the status of their applications. Upon successful approval and confirmation of transactions, the scholarship amount is directly credited to the beneficiary’s account.

![Decentralized Scholarship Ledger](https://docs.agoric.com/assets/new_002_small2.DgAL2zV8.png)

---

## Getting Started

Detailed instructions for setting up the environment, along with a video walkthrough, are available at the [Your First Agoric Dapp](https://docs.agoric.com/guides/getting-started/) tutorial. If your environment is already set up with the correct versions of Node.js, Yarn, Docker, and the Keplr wallet, follow these steps to start the project. *You can also follow these steps in GitHub Codespaces without requiring installation or downloads on your local machine, apart from the Keplr wallet for connecting to the dApp.*

### Steps to Run the Project:

1. **Install dependencies**
   - Run the `yarn install` command to install all solution dependencies. 
     *Note:* This may take several minutes as the project depends on the React framework for the UI, the Agoric framework for smart contracts, and additional development tools for testing, formatting, and static analysis.

2. **Start the local blockchain**
   - Run `yarn start:docker` to initialize a local Agoric blockchain.

3. **Check logs**
   - Use `yarn docker:logs` to monitor the logs. Once the logs resemble the following, you can stop them by pressing `Ctrl + C`:
     ```
     demo-agd-1  | 2023-01-17T04:08:06.384Z block-manager: block 1003 begin
     demo-agd-1  | 2023-01-17T04:08:06.386Z block-manager: block 1003 commit
     demo-agd-1  | 2023-01-17T04:08:07.396Z block-manager: block 1004 begin
     demo-agd-1  | 2023-01-17T04:08:07.398Z block-manager: block 1004 commit
     demo-agd-1  | 2023-01-17T04:08:08.405Z block-manager: block 1005 begin
     demo-agd-1  | 2023-01-17T04:08:08.407Z block-manager: block 1005 commit
     ```

4. **(Codespaces only)**
   - Go to the `PORTS` section in the bottom-right panel, and make all listed ports `public` by selecting `Port Visibility` after right-clicking.

5. **Start the smart contract**
   - Run `yarn start:contract` to deploy the scholarship ledger smart contract.

6. **Start the UI**
   - Run `yarn start:ui` to start the user interface. Open the link provided in the output to access the decentralized scholarship ledger in your browser.

For troubleshooting, refer to the [Getting Started Tutorial](https://docs.agoric.com/guides/getting-started/).

---

## Testing

### Unit Tests:
- Run `yarn test` to execute all unit tests and ensure the functionality of individual components.

### End-to-End Tests:
- Run `yarn test:e2e --browser chrome` to perform end-to-end testing. You can replace `chrome` with your preferred browser name, though `chrome` is recommended for the best results.

---

## Contributing

We welcome contributions to improve this project. 

