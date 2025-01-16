import { useEffect } from 'react';
import './App.css';
import {
  makeAgoricChainStorageWatcher,
  AgoricChainStoragePathKind as Kind,
} from '@agoric/rpc';
import { create } from 'zustand';
import {
  makeAgoricWalletConnection,
  suggestChain,
} from '@agoric/web-components';
import { subscribeLatest } from '@agoric/notifier';

const { fromEntries } = Object;

type Wallet = Awaited<ReturnType<typeof makeAgoricWalletConnection>>;

const ENDPOINTS = {
  RPC: 'http://localhost:26657',
  API: 'http://localhost:1317',
};

const codeSpaceHostName = import.meta.env.VITE_HOSTNAME;
const codeSpaceDomain = import.meta.env
  .VITE_GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

if (codeSpaceHostName && codeSpaceDomain) {
  ENDPOINTS.API = `https://${codeSpaceHostName}-1317.${codeSpaceDomain}`;
  ENDPOINTS.RPC = `https://${codeSpaceHostName}-26657.${codeSpaceDomain}`;
} else {
  console.error(
    'Missing environment variables: VITE_HOSTNAME or VITE_GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN',
  );
}

const watcher = makeAgoricChainStorageWatcher(ENDPOINTS.API, 'agoriclocal');

interface AppState {
  wallet?: Wallet;
  donationInstance?: unknown;
  brands?: Record<string, unknown>;
  purses?: Array<Purse>;
}

const useAppStore = create<AppState>(() => ({}));

const setup = async () => {
  watcher.watchLatest<Array<[string, unknown]>>(
    [Kind.Data, 'published.agoricNames.instance'],
    instances => {
      console.log('got instances', instances);
      // Look for the donation instance
      const donationInstance = instances.find(([name]) => name === 'donation')?.[1];
      if (donationInstance) {
        useAppStore.setState({ donationInstance });
      } else {
        console.error('Donation instance not found in agoricNames.');
      }
    },
  );

  watcher.watchLatest<Array<[string, unknown]>>(
    [Kind.Data, 'published.agoricNames.brand'],
    brands => {
      console.log('Got brands', brands);
      useAppStore.setState({
        brands: fromEntries(brands),
      });
    },
  );
};

const connectWallet = async () => {
  try {
    await fetch(ENDPOINTS.RPC);
  } catch (error) {
    throw new Error('Chain is not running. Please start the chain first!');
  }
  await suggestChain('https://local.agoric.net/network-config');
  const wallet = await makeAgoricWalletConnection(watcher, ENDPOINTS.RPC);
  useAppStore.setState({ wallet });
  const { pursesNotifier } = wallet;
  for await (const purses of subscribeLatest<Purse[]>(pursesNotifier)) {
    console.log('got purses', purses);
    useAppStore.setState({ purses });
  }
};

const makeDonation = (donationAmount: bigint) => {
  const { wallet, donationInstance, brands } = useAppStore.getState();
  if (!donationInstance) {
    alert('No donation contract instance found on the chain RPC: ' + ENDPOINTS.RPC);
    throw Error('no donation contract instance');
  }
  if (!(brands && brands.IST)) {
    alert('IST brand not available');
    throw Error('IST brand not available');
  }

  const give = { Price: { brand: brands.IST, value: donationAmount } };

  wallet?.makeOffer(
    {
      source: 'contract',
      instance: donationInstance,
      publicInvitationMaker: 'makeDonationInvitation',
    },
    { give },
    undefined,
    (update: { status: string; data?: unknown }) => {
      if (update.status === 'error') {
        alert(`Donation error: ${update.data}`);
      }
      if (update.status === 'accepted') {
        alert('Donation accepted! Thank you for your contribution.');
      }
      if (update.status === 'refunded') {
        alert('Donation rejected. Please try again.');
      }
    },
  );
};

function App() {
  useEffect(() => {
    setup();
  }, []);

  const { wallet, purses } = useAppStore(({ wallet, purses }) => ({
    wallet,
    purses,
  }));
  const istPurse = purses?.find(p => p.brandPetname === 'IST');

  const tryConnectWallet = () => {
    connectWallet().catch(err => {
      switch (err.message) {
        case 'KEPLR_CONNECTION_ERROR_NO_SMART_WALLET':
          alert('No smart wallet found at that address.');
          break;
        default:
          alert(err.message);
      }
    });
  };

  return (
    <>
      <h1>Donation Page</h1>
      <div className="card">
        {wallet && istPurse ? (
          <>
            <h2>Make a Donation</h2>
            <button onClick={() => makeDonation(1000000n)}>Donate 1 IST</button>
            <button onClick={() => makeDonation(5000000n)}>Donate 5 IST</button>
            <button onClick={() => makeDonation(10000000n)}>Donate 10 IST</button>
          </>
        ) : (
          <button onClick={tryConnectWallet}>Connect Wallet</button>
        )}
      </div>
    </>
  );
}

export default App;