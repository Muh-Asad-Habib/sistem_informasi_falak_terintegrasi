'use client';

import React, { useState, useEffect } from 'react';
import { RayRing } from '@/components/ui/RayRing';
import { PrayerTimesResult } from 'hisab-core';

interface PrayerCountdownProps {
  prayerTimes: PrayerTimesResult | null;
}

interface NextPrayerInfo {
  name: string;
  time: string;
  remainingSeconds: number;
  percentage: number;
}

export default function PrayerCountdown({ prayerTimes }: PrayerCountdownProps) {
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Run only on client side to prevent hydration mismatches
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!prayerTimes || !currentTime) return;

    const list = [
      { name: 'Imsak', time: prayerTimes.imsak },
      { name: 'Subuh', time: prayerTimes.subuh },
      { name: 'Terbit', time: prayerTimes.terbit },
      { name: 'Dhuha', time: prayerTimes.dhuha },
      { name: 'Zuhur', time: prayerTimes.zuhur },
      { name: 'Asar', time: prayerTimes.asar },
      { name: 'Magrib', time: prayerTimes.magrib },
      { name: 'Isya', time: prayerTimes.isya },
    ];

    const now = new Date(currentTime);
    const todayStr = now.toLocaleDateString('en-US');

    // Parse each prayer time to a Date object today
    const parsedPrayers = list.map((p) => {
      const [hh, mm] = p.time.split(':').map(Number);
      const d = new Date(todayStr);
      d.setHours(hh, mm, 0, 0);
      return { ...p, date: d };
    });

    // Find next prayer
    let next = parsedPrayers.find((p) => p.date.getTime() > now.getTime());
    let prevIndex = -1;

    if (!next) {
      // If all prayers today have passed, the next prayer is Imsak tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toLocaleDateString('en-US');
      const [hh, mm] = prayerTimes.imsak.split(':').map(Number);
      const imsakTomorrow = new Date(tomorrowStr);
      imsakTomorrow.setHours(hh, mm, 0, 0);

      next = {
        name: 'Imsak',
        time: prayerTimes.imsak,
        date: imsakTomorrow,
      };
      // Previous prayer is Isya today
      prevIndex = parsedPrayers.length - 1;
    } else {
      const idx = parsedPrayers.indexOf(next);
      prevIndex = idx === 0 ? parsedPrayers.length - 1 : idx - 1;
    }

    const prev = parsedPrayers[prevIndex];
    let prevDate = prev.date;
    // If previous was yesterday's Isya
    if (next.name === 'Imsak' && prev.name === 'Isya') {
      prevDate = new Date(prev.date);
    } else if (next.name === 'Imsak') {
      // Next is Imsak today, previous is Isya yesterday
      prevDate = new Date(prev.date);
      prevDate.setDate(prevDate.getDate() - 1);
    }

    const totalDuration = next.date.getTime() - prevDate.getTime();
    const remaining = Math.max(0, Math.floor((next.date.getTime() - now.getTime()) / 1000));
    
    // Percentage remaining (for the circular progress)
    const percentage = totalDuration > 0 ? Math.min(100, Math.max(0, (remaining * 1000 / totalDuration) * 100)) : 100;

    setNextPrayer({
      name: next.name,
      time: next.time,
      remainingSeconds: remaining,
      percentage,
    });
  }, [prayerTimes, currentTime]);

  if (!prayerTimes || !nextPrayer) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-sifa-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Format remaining time
  const hours = Math.floor(nextPrayer.remainingSeconds / 3600);
  const minutes = Math.floor((nextPrayer.remainingSeconds % 3600) / 60);
  const seconds = nextPrayer.remainingSeconds % 60;

  const countdownStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <RayRing percentage={nextPrayer.percentage} size={220} strokeWidth={5}>
        <span className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">
          {nextPrayer.name} berikutnya
        </span>
        <span className="font-heading text-4xl font-extrabold text-sifa-green-900 dark:text-sifa-green-100 my-1">
          {nextPrayer.time}
        </span>
        <span className="font-mono text-sm font-semibold text-sifa-gold-600 bg-sifa-gold-50 dark:bg-sifa-gold-100/10 px-2.5 py-0.5 rounded-full">
          -{countdownStr}
        </span>
      </RayRing>

      <p className="text-xs text-foreground/50 italic text-center max-w-xs mt-2">
        Waktu setempat: {currentTime ? currentTime.toLocaleTimeString('id-ID') : '--:--:--'}
      </p>
    </div>
  );
}
