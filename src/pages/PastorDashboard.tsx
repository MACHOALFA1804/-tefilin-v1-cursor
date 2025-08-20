import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from '../components/common/ThemeToggle';

const PastorDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header com Toggle de Tema */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-3xl font-bold">Dashboard do Pastor</h1>
          <p className="text-slate-400 text-lg mt-1">Visão pastoral e gestão espiritual</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Dashboard de Navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Visão Geral dos Visitantes */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Visão Geral dos Visitantes</h2>
              <p className="text-slate-400 text-sm">Estatísticas e relatórios</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Acompanhar o crescimento da igreja através de estatísticas detalhadas dos visitantes.
          </p>
          <button className="w-full px-4 py-3 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors">
            Ver Estatísticas
          </button>
        </div>

        {/* Acompanhamento Espiritual */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Acompanhamento Espiritual</h2>
              <p className="text-slate-400 text-sm">Discipulado e cuidado</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Gerenciar o processo de discipulado e acompanhamento espiritual dos novos membros.
          </p>
          <button className="w-full px-4 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors">
            Gerenciar Discipulado
          </button>
        </div>

        {/* Relatórios Pastorais */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Relatórios Pastorais</h2>
              <p className="text-slate-400 text-sm">Análises e insights</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Gerar relatórios detalhados para análise pastoral e tomada de decisões estratégicas.
          </p>
          <button className="w-full px-4 py-3 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300 transition-colors">
            Gerar Relatórios
          </button>
        </div>

        {/* Gestão de Cultos */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Gestão de Cultos</h2>
              <p className="text-slate-400 text-sm">Programação e eventos</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Organizar e gerenciar a programação de cultos, eventos especiais e atividades da igreja.
          </p>
          <button className="w-full px-4 py-3 rounded-lg bg-emerald-400 text-slate-900 font-bold shadow-md shadow-emerald-500/30 hover:bg-emerald-300 transition-colors">
            Gerenciar Cultos
          </button>
        </div>

        {/* Comunicação Pastoral */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-300 grid place-items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Comunicação Pastoral</h2>
              <p className="text-slate-400 text-sm">Mensagens e orientações</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Enviar mensagens pastorais, orientações e comunicados para a congregação.
          </p>
          <button className="w-full px-4 py-3 rounded-lg bg-yellow-400 text-slate-900 font-bold shadow-md shadow-yellow-500/30 hover:bg-yellow-300 transition-colors">
            Enviar Mensagens
          </button>
        </div>

        {/* Configurações Pastorais */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-300 grid place-items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Configurações Pastorais</h2>
              <p className="text-slate-400 text-sm">Preferências e ajustes</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Configurar preferências pastorais, notificações e personalizar o dashboard.
          </p>
          <button className="w-full px-4 py-3 rounded-lg bg-rose-400 text-slate-900 font-bold shadow-md shadow-rose-500/30 hover:bg-rose-300 transition-colors">
            Configurar
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">0</div>
          <div className="text-slate-400 text-sm">Total Visitantes</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">0</div>
          <div className="text-slate-400 text-sm">Novos Membros</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">0</div>
          <div className="text-slate-400 text-sm">Em Discipulado</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">0</div>
          <div className="text-slate-400 text-sm">Cultos Realizados</div>
        </div>
      </div>

      <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
    </main>
  );
};

export default PastorDashboard;


