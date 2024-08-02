import React, { useEffect, useRef, useState } from "react";
import CryptoJS from "crypto-js";

interface ICoins {
  hex: string;
  count: number;
  level: number;
}

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [hash, setHash] = useState("");
  const [count, setCount] = useState(0);
  const [coins, setCoins] = useState<ICoins[]>([]);
  const [level, setLevel] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const countRef = useRef(count);
  const levelRef = useRef(level);

  useEffect(() => {
    countRef.current = count;
    levelRef.current = level;
  }, [count, level]);

  const start = () => {
    if (!isRunning) {
      intervalRef.current = setInterval(() => {
        setHash((prevHash) => {
          const newHash = CryptoJS.SHA256(prevHash).toString(CryptoJS.enc.Hex);
          checkHex(newHash);
          return newHash;
        });
        setCount((c) => c + 1);
      }, 10);
      setIsRunning(true);
    }
  };

  const stop = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = undefined;
    setIsRunning(false);
  };

  const clear = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setCount(0);
    setHash("");
    setCoins([]);
  };

  const checkHex = (hex: string) => {
    if (hex.startsWith("0".repeat(level))) {
      setCoins((prev) => [
        ...prev,
        { hex, count: countRef.current, level: levelRef.current },
      ]);
    }
  };

  const onLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevel(Number(event.target.value));
  };

  const downloadCoin = () => {
    const shouldDownload = window.confirm(
      "코인 데이터를 다운로드 하시겠습니까?"
    );
    if (!shouldDownload) {
      return;
    }
    const headText = `${new Date().toLocaleString()}에 happy mining!에서 채굴된 코인입니다.\n채굴한 코인 개수: ${
      coins.length
    }\n`;
    const coinsText = coins
      .map(
        (coin) =>
          `HEX값: ${coin.hex}, Count: ${coin.count}, level: ${coin.level}`
      )
      .join(`\n`);
    const blob = new Blob([headText, coinsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${new Date().toLocaleString()} COINS.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <h1>happy mining!</h1>
      <div>
        <h4>채굴 난이도</h4>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={level}
          onChange={onLevelChange}
          disabled={isRunning}
        />
        {level >= 4 ? <strong>{level} (not recommended)</strong> : level}
      </div>
      <div>
        <h4>count (mining speed: 10ms)</h4>
        <span>{count}</span>
      </div>
      <div>
        <h4>현재 HEX값</h4>
        <span>{hash === "" ? "-" : hash}</span>
      </div>
      <div>
        <button onClick={start}>start</button>
        <button onClick={stop}>stop</button>
        <button onClick={clear}>clear</button>
        <button onClick={downloadCoin}>download</button>
      </div>
      <div>
        <h4>COIN: {coins.length}</h4>
        {coins.map((coin) => (
          <div key={coin.hex}>
            {coin.hex} count: {coin.count} level: {coin.level}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
