"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction, signTransaction } = useWallet();

  const [balance, setBalance] = useState<number | null>(null);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("1000000");
  const [decimals, setDecimals] = useState("9");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    connection.getBalance(publicKey).then((bal) => {
      setBalance(bal / LAMPORTS_PER_SOL);
    });
  }, [publicKey, connection]);

  const handleCreateToken = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      alert("Wallet belum terhubung");
      return;
    }
    if (!tokenName || !tokenSymbol) {
      alert("Isi nama dan symbol token dulu");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const wallet = {
        publicKey,
        signTransaction,
      };

      const mint = await createMint(
        connection,
        wallet as any,
        publicKey,
        publicKey,
        Number(decimals)
      );

      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet as any,
        mint,
        publicKey
      );

      await mintTo(
        connection,
        wallet as any,
        mint,
        tokenAccount.address,
        publicKey,
        Number(tokenSupply) * Math.pow(10, Number(decimals))
      );

      setResult(mint.toBase58());
    } catch (err: any) {
      console.error(err);
      alert("Gagal membuat token: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction, connection, tokenName, tokenSymbol, tokenSupply, decimals]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Solana Token Creator</h1>
      <WalletMultiButton />

      {connected && publicKey && (
        <div className="text-center">
          <p className="break-all">Alamat: {publicKey.toBase58()}</p>
          <p>Saldo: {balance !== null ? `${balance} SOL` : "Loading..."}</p>
        </div>
      )}

      {connected && (
        <div className="flex flex-col gap-3 w-full max-w-sm border p-4 rounded-lg">
          <h2 className="font-bold text-lg">Buat Token Baru</h2>
          <input
            className="border p-2 rounded text-black"
            placeholder="Nama Token"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
          />
          <input
            className="border p-2 rounded text-black"
            placeholder="Symbol (contoh: MYTOKEN)"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
          />
          <input
            className="border p-2 rounded text-black"
            placeholder="Jumlah Supply"
            value={tokenSupply}
            onChange={(e) => setTokenSupply(e.target.value)}
          />
          <input
            className="border p-2 rounded text-black"
            placeholder="Decimals"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
          />
          <button
            onClick={handleCreateToken}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? "Membuat token..." : "Buat Token"}
          </button>

          {result && (
            <div className="text-sm break-all mt-2 p-2 bg-green-100 text-green-800 rounded">
              Token berhasil dibuat! Mint Address: {result}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
