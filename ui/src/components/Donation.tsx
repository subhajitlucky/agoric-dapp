import React, { useState } from 'react';

interface DonationProps {
  makeDonation: (amount: bigint) => void;
  istPurse?: { balance: { value: number } }; // Assuming 'Purse' has a balance property with a value
  walletConnected: boolean;
}

const Donation: React.FC<DonationProps> = ({ makeDonation, istPurse, walletConnected }) => {
  const [donationAmount, setDonationAmount] = useState<string>('');

  const handleDonation = () => {
    if (!walletConnected) {
      alert('Please connect your wallet to make a donation.');
      return;
    }
    
    const amount = BigInt(Number(donationAmount) * 1_000_000); // Convert to smallest unit of IST
    makeDonation(amount);
    setDonationAmount(''); // Clear the input after donation
  };

  return (
    <div className="donation-section">
      <h2>Donate</h2>
      <div>
        <label htmlFor="donationAmount">Donation Amount (IST): </label>
        <input 
          id="donationAmount"
          type="number" 
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          placeholder="Enter Donation Amount"
          disabled={!walletConnected}
        />
      </div>
      <button onClick={handleDonation} disabled={!walletConnected || !donationAmount}>
        Donate
      </button>
      {istPurse && (
        <p>Your IST balance: {istPurse.balance.value / 1_000_000} IST</p>
      )}
    </div>
  );
};

export default Donation;