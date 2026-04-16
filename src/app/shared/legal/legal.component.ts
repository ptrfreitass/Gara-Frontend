// src/app/features/legal/legal.component.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface Section {
  title: string;
  content: string;
}

interface LegalContent {
  title: string;
  subtitle: string;
  icon: string;
  sections: Section[];
  linkLabel: string;
  linkRoute: string;
}

const LEGAL_CONTENT: Record<'terms' | 'policy', LegalContent> = {
  terms: {
    title: 'Termos de Serviço',
    subtitle: 'Leia com atenção antes de utilizar a plataforma.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    sections: [
      {
        title: '1. Aceitação dos Termos',
        content: 'Ao utilizar nossa plataforma de gestão financeira e pessoal, você concorda com o monitoramento organizacional de seus dados de estoque e extratos. O uso contínuo da plataforma implica na aceitação integral destes termos.',
      },
      {
        title: '2. Responsabilidade Financeira',
        content: 'O sistema é uma ferramenta de auxílio. O registro de extratos bancários é de responsabilidade do usuário, não possuindo vínculo direto com instituições financeiras para execução de transações.',
      },
      {
        title: '3. Uso do Estoque e Compras',
        content: 'A lista de compras e estoque pessoal são processados localmente para otimização de sua rotina doméstica. Não nos responsabilizamos por decisões tomadas com base nas informações registradas.',
      },
      {
        title: '4. Modificações',
        content: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre alterações significativas por e-mail.',
      },
    ],
    linkLabel: 'Ver Política de Privacidade',
    linkRoute: '/legal/policy',
  },
  policy: {
    title: 'Política de Privacidade',
    subtitle: 'Sua privacidade é nossa prioridade.',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    sections: [
      {
        title: '1. Privacidade de Dados',
        content: 'Seus dados financeiros e extratos são protegidos por criptografia AES-256. Não vendemos, alugamos ou compartilhamos suas informações com terceiros, corretoras ou anunciantes.',
      },
      {
        title: '2. LGPD e Transparência',
        content: 'Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito total de exportação, retificação e exclusão de seus registros de agenda, finanças e listas de compras a qualquer momento.',
      },
      {
        title: '3. Cookies e Performance',
        content: 'Utilizamos apenas cookies essenciais para autenticação e preferências de sessão. Não utilizamos cookies de rastreamento ou publicidade.',
      },
      {
        title: '4. Retenção de Dados',
        content: 'Seus dados são mantidos enquanto sua conta estiver ativa. Após a exclusão da conta, todos os dados são removidos permanentemente em até 30 dias.',
      },
    ],
    linkLabel: 'Ver Termos de Serviço',
    linkRoute: '/legal/terms',
  },
};

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-linear-to-bl from-secondary-500 to-primary-600 py-12 px-4 sm:px-6 lg:px-8 flex items-start justify-center">
      <div class="w-full max-w-2xl">

        <!-- Voltar -->
        <a routerLink="/"
          class="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors group">
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Voltar ao início
        </a>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <!-- Header -->
          <div class="bg-linear-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="content().icon"/>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-extrabold tracking-tight">{{ content().title }}</h1>
                <p class="text-white/70 text-sm mt-0.5">{{ content().subtitle }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-white/60 text-xs mt-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Última atualização: 23 de fevereiro de 2026
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="p-8 space-y-6">
            @for (section of content().sections; track section.title) {
              <div class="group">
                <h2 class="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                  {{ section.title }}
                </h2>
                <p class="text-sm text-gray-600 leading-relaxed pl-3.5">
                  {{ section.content }}
                </p>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-400">© {{ currentYear }} Gara · Todos os direitos reservados</span>
            </div>
            <div class="flex items-center gap-3">
              <a [routerLink]="content().linkRoute"
                class="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                {{ content().linkLabel }}
              </a>
              <span class="text-gray-300">|</span>
              <a routerLink="/auth/register"
                class="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all active:scale-95">
                Aceitar e Continuar
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class LegalComponent implements OnInit {
  private route = inject(ActivatedRoute);

  readonly currentYear = new Date().getFullYear();

  type = signal<'terms' | 'policy'>('terms');

  content = computed(() => LEGAL_CONTENT[this.type()]);

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      const last = segments[segments.length - 1]?.path;
      this.type.set(last === 'policy' ? 'policy' : 'terms');
    });
  }
}