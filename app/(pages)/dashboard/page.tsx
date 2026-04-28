"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PresetKey = "1D" | "1W" | "1M" | "1Y" | "CUSTOM";
type TransactionFilter = "ALL" | "INCOME" | "EXPENSE" | "TAX";

type FactoryBill = { billDate: string; totalPrice: string };
type StoreTransaction = { billDate: string; totalPrice: string; transactionType: "INCOME" | "EXPENSE" };
type TaxRecord = { taxDate: string; amount: string };

const PRESET_LABELS: Record<PresetKey, string> = {
  "1D": "1 วัน",
  "1W": "1 สัปดาห์",
  "1M": "1 เดือน",
  "1Y": "1 ปี",
  CUSTOM: "กำหนดเอง"
};

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getRangeFromPreset(preset: Exclude<PresetKey, "CUSTOM">) {
  const end = new Date();
  const start = new Date(end);
  if (preset === "1D") start.setDate(end.getDate() - 1);
  if (preset === "1W") start.setDate(end.getDate() - 7);
  if (preset === "1M") start.setMonth(end.getMonth() - 1);
  if (preset === "1Y") start.setFullYear(end.getFullYear() - 1);
  return { start, end };
}

function getCurrentToNextSevenDaysRange() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function enumerateDates(startDate: Date, endDate: Date) {
  const dates: string[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(formatDateInput(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function DashboardPage() {
  const initialRange = useMemo(() => getCurrentToNextSevenDaysRange(), []);
  const [preset, setPreset] = useState<PresetKey>("CUSTOM");
  const [filter, setFilter] = useState<TransactionFilter>("ALL");
  const [startDate, setStartDate] = useState(formatDateInput(initialRange.start));
  const [endDate, setEndDate] = useState(formatDateInput(initialRange.end));
  const [factoryBills, setFactoryBills] = useState<FactoryBill[]>([]);
  const [storeTransactions, setStoreTransactions] = useState<StoreTransaction[]>([]);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const openDatePicker = (event: { currentTarget: HTMLInputElement }) => {
    try {
      event.currentTarget.showPicker?.();
    } catch {
      // Ignore browsers that block picker opening without strict user gesture.
    }
  };

  useEffect(() => {
    if (preset === "CUSTOM") return;
    const range = getRangeFromPreset(preset);
    setStartDate(formatDateInput(range.start));
    setEndDate(formatDateInput(range.end));
  }, [preset]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          startDate: `${startDate}T00:00:00.000Z`,
          endDate: `${endDate}T23:59:59.999Z`,
          limit: "100"
        });

        const [factoryRes, storeRes, taxRes] = await Promise.all([
          fetch(`/api/factory-bills?${params.toString()}`),
          fetch(`/api/store-transactions?${params.toString()}`),
          fetch(`/api/tax-records?${params.toString()}`)
        ]);

        if (!factoryRes.ok || !storeRes.ok || !taxRes.ok) {
          throw new Error("โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
        }

        const [factoryData, storeData, taxData] = await Promise.all([
          factoryRes.json(),
          storeRes.json(),
          taxRes.json()
        ]);

        setFactoryBills(factoryData);
        setStoreTransactions(storeData);
        setTaxRecords(taxData);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      } finally {
        setLoading(false);
      }
    }

    if (startDate && endDate) {
      loadDashboardData();
    }
  }, [startDate, endDate]);

  const summary = useMemo(() => {
    const factoryIncome = factoryBills.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const storeIncome = storeTransactions
      .filter((item) => item.transactionType === "INCOME")
      .reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const totalExpense = storeTransactions
      .filter((item) => item.transactionType === "EXPENSE")
      .reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const totalTax = taxRecords.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      factoryIncome,
      storeIncome,
      totalExpense,
      totalTax
    };
  }, [factoryBills, storeTransactions, taxRecords]);

  const chartData = useMemo(() => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const dayKeys = enumerateDates(start, end);

    const map = new Map<string, { date: string; income: number; expense: number; tax: number }>();
    for (const day of dayKeys) {
      map.set(day, { date: day, income: 0, expense: 0, tax: 0 });
    }

    for (const item of factoryBills) {
      const key = formatDateInput(new Date(item.billDate));
      const row = map.get(key);
      if (row) row.income += Number(item.totalPrice || 0);
    }

    for (const item of storeTransactions) {
      const key = formatDateInput(new Date(item.billDate));
      const row = map.get(key);
      if (!row) continue;
      if (item.transactionType === "INCOME") row.income += Number(item.totalPrice || 0);
      if (item.transactionType === "EXPENSE") row.expense += Number(item.totalPrice || 0);
    }

    for (const item of taxRecords) {
      const key = formatDateInput(new Date(item.taxDate));
      const row = map.get(key);
      if (row) row.tax += Number(item.amount || 0);
    }

    return Array.from(map.values()).map((item) => ({
      ...item,
      label: parseLocalDate(item.date).toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit" })
    }));
  }, [factoryBills, storeTransactions, taxRecords, startDate, endDate]);

  const cards = [
    { title: "รายรับจากโรงงานรวม", value: summary.factoryIncome },
    { title: "รายรับจากร้านค้ารวม", value: summary.storeIncome },
    { title: "รายจ่ายรวม", value: summary.totalExpense },
    { title: "ภาษีรวม", value: summary.totalTax }
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">สรุปแดชบอร์ด</h1>
        <p className="text-sm text-muted-foreground">ติดตามรายรับ รายจ่าย และภาษีในช่วงเวลาที่ต้องการ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ตัวกรองข้อมูล</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["1D", "1W", "1M", "1Y", "CUSTOM"] as PresetKey[]).map((key) => (
              <Button
                key={key}
                type="button"
                variant={preset === key ? "default" : "outline"}
                onClick={() => setPreset(key)}
              >
                {PRESET_LABELS[key]}
              </Button>
            ))}
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dashboard-type">ประเภทรายการ</Label>
              <select
                id="dashboard-type"
                className="h-10 w-full rounded-md border border-input px-3"
                value={filter}
                onChange={(event) => setFilter(event.target.value as TransactionFilter)}
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="INCOME">เฉพาะรายรับ</option>
                <option value="EXPENSE">เฉพาะรายจ่าย</option>
                <option value="TAX">เฉพาะภาษี</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-start-date">วันที่เริ่มต้น</Label>
              <Input
                id="dashboard-start-date"
                type="date"
                value={startDate}
                onClick={openDatePicker}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-end-date">วันที่สิ้นสุด</Label>
              <Input
                id="dashboard-end-date"
                type="date"
                value={endDate}
                onClick={openDatePicker}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold sm:text-xl">{Number(card.value).toFixed(2)} บาท</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>กราฟรายรับ / รายจ่าย / ภาษี</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูลกราฟ...</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!loading && !error ? (
            <div className="h-[300px] w-full sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {filter !== "EXPENSE" && filter !== "TAX" ? (
                    <Bar dataKey="income" name="รายรับ" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  ) : null}
                  {filter !== "INCOME" && filter !== "TAX" ? (
                    <Bar dataKey="expense" name="รายจ่าย" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  ) : null}
                  {filter !== "INCOME" && filter !== "EXPENSE" ? (
                    <Bar dataKey="tax" name="ภาษี" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  ) : null}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
