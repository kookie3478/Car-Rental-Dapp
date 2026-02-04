import { useEffect, useState, useContext } from "react";
import { Web3Context } from "../../../../context/Web3Context";
import { getOwnerHistory } from "../../../../context/useCarRental";
import { ethers } from "ethers";
import EarningsChart from "./EarningsChart";
import "./EarningsOverview.css";

export default function EarningsOverview() {
  const { account } = useContext(Web3Context);

  const [dailyEarnings, setDailyEarnings] = useState({});
  const [totalEarnings, setTotalEarnings] = useState("0.00");

  useEffect(() => {
    if (!account) return;

    const loadEarnings = async () => {
      const history = await getOwnerHistory(account);

      const dayMap = {};
      let total = 0n;

      for (const rental of history) {
        if (Number(rental.endTime) === 0) continue;

        const day = new Date(Number(rental.endTime) * 1000)
          .toISOString()
          .slice(0, 10); // YYYY-MM-DD

        const paid = BigInt(rental.totalPaid);

        dayMap[day] = (dayMap[day] || 0n) + paid;
        total += paid;
      }

      // Convert BigInt → ETH strings
      const formatted = {};
      for (const day in dayMap) {
        formatted[day] = Number(ethers.formatEther(dayMap[day]));
      }

      setDailyEarnings(formatted);
      setTotalEarnings(Number(ethers.formatEther(total)).toFixed(4));
    };

    loadEarnings();
  }, [account]);

  return (
    <div className="card earnings-heatmap">
      <div className="earnings-header">
        <h3>Total Earnings</h3>
        <span>Ξ {totalEarnings}</span>
      </div>

      <EarningsChart data={dailyEarnings} />
    </div>
  );
}
