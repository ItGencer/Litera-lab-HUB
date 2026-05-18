import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
 
@Component({
  selector: 'llh-error-component',
  imports: [RouterLink],
  templateUrl: './error-component.html',
  styleUrl: './error-component.scss',
})
export class ErrorComponent implements OnInit, OnDestroy {
 
  // ── Цитати, що обертаються кожні 4 секунди ──
  private readonly quotes = [
    { text: 'Не всі, хто блукає, загублені.',               author: 'Дж. Р. Р. Толкін'   },
    { text: 'Книги — кораблі думки, що мандрують часом.',   author: 'Ф. Бекон'            },
    { text: 'Читати — означає думати чужим розумом.',       author: 'А. Шопенгауер'       },
    { text: 'У книжках ховається душа минулих часів.',      author: 'Т. Карлейль'         },
  ];
 
  private quoteIndex = 0;
  private intervalId?: ReturnType<typeof setInterval>;
 
  ngOnInit(): void {
    this.intervalId = setInterval(() => this.rotateQuote(), 4000);
  }
 
  ngOnDestroy(): void {
    clearInterval(this.intervalId); // уникаємо витоку пам'яті при SSR
  }
 
  private rotateQuote(): void {
    const block  = document.getElementById('quote-block');
    const text   = document.getElementById('quote-text');
    const author = document.getElementById('quote-author');
 
    if (!block || !text || !author) return;
 
    // Крок 1 — ховаємо
    block.classList.add('is-hidden');
 
    // Крок 2 — через 350 мс міняємо текст та показуємо знову
    setTimeout(() => {
      this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
      const q = this.quotes[this.quoteIndex];
      text.textContent   = `«\u00a0${q.text}\u00a0»`;
      author.textContent = `— ${q.author}`;
      block.classList.remove('is-hidden');
    }, 350);
  }
}
 