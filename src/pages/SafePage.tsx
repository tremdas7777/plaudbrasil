const SafePage = () => {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", lineHeight: 1.6, color: '#333', backgroundColor: '#ffffff', margin: 0, padding: 0, minHeight: '100vh' }}>
      <header style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', padding: '40px 20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '10px', fontWeight: 700 }}>🎙️ Gravadores de Voz com IA — Guia Completo</h1>
        <p style={{ fontSize: '1.1em', opacity: 0.9 }}>Conheça a evolução dos gravadores inteligentes e como a IA está transformando a transcrição</p>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        {[
          {
            title: 'O que são Gravadores com IA?',
            text: 'Gravadores de voz com inteligência artificial são dispositivos que não apenas captam áudio, mas também transcrevem, resumem e organizam o conteúdo automaticamente. Utilizando modelos avançados de processamento de linguagem natural (NLP), eles conseguem identificar diferentes falantes, gerar resumos executivos e até traduzir conversas em tempo real.',
            source: 'TechRadar - Best AI Voice Recorders 2026',
            url: 'https://www.techradar.com/best/best-voice-recorders',
          },
          {
            title: 'A Evolução da Transcrição Automática',
            text: 'Desde os primeiros softwares de reconhecimento de voz nos anos 90 até os modelos de IA atuais como Whisper e GPT, a transcrição automática evoluiu enormemente. Hoje, a precisão supera 95% em ambientes controlados, e dispositivos dedicados conseguem processar áudio localmente sem necessidade de conexão à internet, garantindo privacidade e velocidade.',
            source: 'MIT Technology Review - The Future of Speech Recognition',
            url: 'https://www.technologyreview.com/',
          },
          {
            title: 'Aplicações Profissionais',
            text: 'Jornalistas, advogados, médicos e executivos são alguns dos profissionais que mais se beneficiam dessas tecnologias. Em reuniões corporativas, gravadores com IA podem gerar atas automáticas, destacar itens de ação e enviar resumos por e-mail. Na medicina, auxiliam na documentação de consultas, reduzindo a carga administrativa dos profissionais de saúde.',
            source: 'Forbes - How AI is Changing Business Meetings',
            url: 'https://www.forbes.com/sites/technology/',
          },
          {
            title: 'Privacidade e Segurança',
            text: 'Com o aumento da gravação de conversas, questões de privacidade se tornam cada vez mais importantes. Dispositivos modernos oferecem processamento on-device (no próprio aparelho), criptografia de ponta a ponta e controles granulares de acesso. É fundamental escolher dispositivos que priorizem a segurança dos dados e estejam em conformidade com regulamentações como a LGPD.',
            source: 'Wired - Privacy in the Age of AI Recording',
            url: 'https://www.wired.com/tag/privacy/',
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: '40px', padding: '25px', backgroundColor: '#f9f9f9', borderLeft: '4px solid #1a1a2e', borderRadius: '4px' }}>
            <h2 style={{ color: '#1a1a1a', marginBottom: '15px', fontSize: '1.6em', borderBottom: '2px solid #1a1a2e', paddingBottom: '10px' }}>{section.title}</h2>
            <p style={{ marginBottom: '12px', textAlign: 'justify', fontSize: '1em' }}>{section.text}</p>
            <div style={{ fontSize: '0.85em', color: '#666', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
              Fonte: <a href={section.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>{section.source}</a>
            </div>
          </div>
        ))}
      </div>

      <footer style={{ backgroundColor: '#f0f0f0', color: '#666', textAlign: 'center', padding: '20px', marginTop: '40px', fontSize: '0.9em', borderTop: '1px solid #ddd' }}>
        <p>&copy; 2026 Guia de Gravadores com IA. Todos os direitos reservados.</p>
        <p>Página informativa sobre tecnologia de gravação e transcrição.</p>
      </footer>
    </div>
  );
};

export default SafePage;
