'use client';

import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import NomineeGrid from '../components/NomineeGrid';
import VoteModal from '../components/VoteModal';
import Leaderboard from '../components/Leaderboard';
import Prizes from '../components/Prizes';
import HowItWorks from '../components/HowItWorks';
import Faq from '../components/Faq';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { getCategories, getSettings, getLeaderboard } from '../lib/api';

const DEFAULT_PRIZES = ['Gold Medallion', 'National Feature', 'Verified Badge', 'Awards Gala Invite'];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [votingNominee, setVotingNominee] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    getCategories().then((d) => setCategories(d.categories || [])).catch(() => {});
    getSettings().then((d) => setSettings(d.settings || {})).catch(() => {});
    getLeaderboard({ limit: 1 }).then((d) => setTotalVotes(d.total_votes || 0)).catch(() => {});
  }, []);

  const deadline = settings.voting_deadline || '2026-09-01T00:00:00.000Z';
  const prizes = settings.prizes || DEFAULT_PRIZES;

  return (
    <>
      <Nav />
      <Hero deadline={deadline} totalVotes={totalVotes} />
      <Categories categories={categories} onSelect={setSelectedCategory} />
      <div className="bg-white border-y border-navy/10">
        <NomineeGrid categories={categories} initialCategory={selectedCategory} onVote={setVotingNominee} />
      </div>
      <Leaderboard />
      <Prizes prizes={prizes} />
      <HowItWorks />
      <Faq />
      <Contact />
      <Footer />

      {votingNominee && <VoteModal nominee={votingNominee} onClose={() => setVotingNominee(null)} />}
    </>
  );
}
