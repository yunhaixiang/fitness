(() => {
  'use strict';

  const page = location.pathname.split('/').filter(Boolean).at(-1);
  const content = document.querySelector('.page-container > .prose');

  if (content && ['diet', 'cardio', 'stats'].includes(page)) {
    const nodes = [...content.childNodes];
    let card = null;
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H2') {
        card = document.createElement('section');
        card.className = 'content-section-card';
        content.insertBefore(card, node);
      }
      if (card) card.append(node);
    }
    content.classList.add('section-card-page');

    if (page === 'diet') {
      const cheat = content.querySelector('.diet-cheat-section');
      const scheduleCard = content.querySelector('.content-section-card');
      if (cheat && scheduleCard) {
        const cheatCard = document.createElement('section');
        cheatCard.className = 'content-section-card diet-cheat-card';
        scheduleCard.after(cheatCard);
        cheatCard.append(cheat);
      }
    }
  }

  if (content && page === 'shopping') {
    const shopping = content.querySelector('.visual-shopping');
    if (!shopping) return;
    const utility = content.querySelector('.utility-bar');
    const nodes = [...shopping.children];
    let card = document.createElement('section');
    card.className = 'content-section-card shopping-summary-card';
    shopping.prepend(card);
    for (const node of nodes) {
      if (node.matches('h2.visual-section-label')) {
        card = document.createElement('section');
        card.className = 'content-section-card';
        shopping.insertBefore(card, node);
      }
      card.append(node);
    }
    if (utility) {
      const summary = shopping.querySelector('.shopping-summary-card');
      summary.querySelector('.visual-shopping-total')?.after(utility);
    }
    content.classList.add('section-card-page');
    shopping.classList.add('section-card-stack');
  }

  if (page === 'strength') {
    document.querySelectorAll('#strength-root .strength-volume, #strength-root .visual-training-day')
      .forEach((section) => section.classList.add('content-section-card'));
  }
})();
