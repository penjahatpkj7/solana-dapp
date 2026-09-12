"use client";

import dynamic from "next/dynamic";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / 1_000_000_000);
      });
    } else {
      setBalance(null);
    }
  }, [publicKey, connection]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Solana Dapp</h1>
      <WalletMultiButton />
      {connected && publicKey && (
        <div className="text-center">
          <p className="break-all">Alamat: {publicKey.toBase58()}</p>
          <p>
            Saldo: {balance !== null ? `${balance} SOL` : "Loading..."}
          </p>
        </div>
      )}
    </main>
  );
}
