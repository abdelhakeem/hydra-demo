import 'dotenv/config';
import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js';
import { Fanout, FanoutClient, MembershipModel } from '@glasseaters/hydra-sdk';
import { NodeWallet } from '@metaplex/js';

(async () => {
  const getKeypair = () => {
    const secret = JSON.parse(process.env.PRIVATE_KEY || '[]');
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  };

  const connection = new Connection(clusterApiUrl('devnet'));
  const authorityWallet = getKeypair();
  const walletName = `Test@${Date.now()}`;


  const fanoutClient = new FanoutClient(
    connection,
    new NodeWallet(authorityWallet)
  );

  await fanoutClient.initializeFanout({
    totalShares: 100,
    name: walletName,
    membershipModel: MembershipModel.Wallet
  })

  const fanoutAccounts = (await connection.getProgramAccounts(
    FanoutClient.ID, {
    filters: [
      {
        dataSize: 300
      },
      {
        memcmp: {
          offset: 8,
          bytes: authorityWallet.publicKey.toBase58()
        }
      }
    ]
  })).map(({ account }) => Fanout.deserialize(account.data)[0]);

  console.log(fanoutAccounts);
})();
