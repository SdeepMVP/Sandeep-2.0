/* Combinaisons de couleurs éprouvées pour l'onglet Wardrobe (recherche web, octobre 2026).
   Sources : guides couleurs homme de Siyaram, StudioSuits, Aza Fashions, Care of Carl,
   Real Men Real Style, Westwood Hart, Effortless Gent, FashionBeans, Permanent Style, Sartoro.
   Idées communes : base de neutres + une couleur d'accent, contraste clair/foncé,
   chaussures assorties au pantalon (le marron va avec presque tout, pas de noir avec le beige). */
(function () {
  'use strict';
  var S2 = (window.S2 = window.S2 || {});
  /* Traduction (S2.L, absent sous Node : anglais). */
  var L = S2.L || function (en) { return en; };

  S2.wardrobeCombos = {
    /* Paires de couleurs qui marchent (entre vêtements visibles : manteau, couche, haut, bas). */
    pairs: [
      ['navy', 'white', L('Navy & white: timeless', 'Marine & blanc : intemporel')],
      ['black', 'white', L('Black & white: sharp contrast', 'Noir & blanc : contraste net')],
      ['black', 'grey', L('Black & grey: sleek monochrome', 'Noir & gris : monochrome épuré')],
      ['black', 'charcoal', L('Black & charcoal: sleek monochrome', 'Noir & anthracite : monochrome épuré')],
      ['grey', 'navy', L('Grey & navy: smart and easy', 'Gris & marine : chic et facile')],
      ['charcoal', 'white', L('Charcoal & white: crisp', 'Anthracite & blanc : net')],
      ['brown', 'navy', L('Brown & navy: warm and smart', 'Marron & marine : chaleureux et chic')],
      ['camel', 'navy', L('Camel & navy: contrast with harmony', 'Camel & marine : contraste harmonieux')],
      ['camel', 'white', L('Camel & white: clean and warm', 'Camel & blanc : net et chaleureux')],
      ['camel', 'black', L('Camel & black: elegant', 'Camel & noir : élégant')],
      ['camel', 'grey', L('Camel & grey: soft and refined', 'Camel & gris : doux et raffiné')],
      ['beige', 'olive', L('Beige & olive: earthy', 'Beige & olive : terreux')],
      ['beige', 'navy', L('Beige & navy: menswear classic', 'Beige & marine : classique masculin')],
      ['beige', 'white', L('Beige & white: light and fresh', 'Beige & blanc : léger et frais')],
      ['olive', 'white', L('Olive & white: fresh', 'Olive & blanc : frais')],
      ['olive', 'cream', L('Olive & cream: warm-weather favourite', 'Olive & crème : favori des beaux jours')],
      ['olive', 'navy', L('Olive & navy: rugged and smart', 'Olive & marine : robuste et chic')],
      ['olive', 'brown', L('Olive & brown: earthy', 'Olive & marron : terreux')],
      ['olive', 'black', L('Olive & black: utilitarian', 'Olive & noir : utilitaire')],
      ['burgundy', 'navy', L('Burgundy & navy: rich and classic', 'Bordeaux & marine : riche et classique')],
      ['burgundy', 'grey', L('Burgundy & grey: rich without trying too hard', 'Bordeaux & gris : riche sans en faire trop')],
      ['burgundy', 'charcoal', L('Burgundy & charcoal: deep and confident', 'Bordeaux & anthracite : profond et assuré')],
      ['burgundy', 'cream', L('Burgundy & cream: rich', 'Bordeaux & crème : riche')],
      ['burgundy', 'beige', L('Burgundy & beige: warm', 'Bordeaux & beige : chaleureux')],
      ['lightblue', 'navy', L('Light blue & navy: tonal blues', 'Bleu clair & marine : camaïeu de bleus')],
      ['lightblue', 'beige', L('Light blue & tan: fresh', 'Bleu clair & beige : frais')],
      ['lightblue', 'camel', L('Light blue & camel: fresh', 'Bleu clair & camel : frais')],
      ['lightblue', 'grey', L('Light blue & grey: soft', 'Bleu clair & gris : doux')],
      ['lightblue', 'white', L('Light blue & white: summer clean', 'Bleu clair & blanc : net et estival')],
      ['denim', 'white', L('Denim & white: easy casual', 'Denim & blanc : décontracté facile')],
      ['denim', 'grey', L('Denim & grey: relaxed', 'Denim & gris : détendu')],
      ['denim', 'black', L('Denim & black: night-out casual', 'Denim & noir : décontracté pour sortir')],
      ['green', 'white', L('Green & white: clean', 'Vert & blanc : net')],
      ['green', 'beige', L('Green & beige: natural', 'Vert & beige : naturel')],
      ['pink', 'navy', L('Pink & navy: confident', 'Rose & marine : assuré')],
      ['pink', 'grey', L('Grey & pastel pink: soft', 'Gris & rose pastel : doux')],
      ['yellow', 'navy', L('Yellow & navy: bold but safe', 'Jaune & marine : osé mais sûr')],
      ['yellow', 'grey', L('Grey & pastel yellow: soft', 'Gris & jaune pastel : doux')],
      ['teal', 'beige', L('Teal & beige: relaxed', 'Bleu canard & beige : détendu')],
      ['purple', 'grey', L('Purple & grey: subtle', 'Violet & gris : subtil')],
      ['red', 'navy', L('Red & navy: punchy', 'Rouge & marine : percutant')],
      ['orange', 'navy', L('Orange & navy: complementary', 'Orange & marine : complémentaires')],
      ['blue', 'white', L('Blue & white: crisp', 'Bleu & blanc : net')],
      ['blue', 'beige', L('Blue & beige: relaxed', 'Bleu & beige : détendu')],
      ['khaki', 'navy', L('Khaki & navy: smart classic', 'Kaki & marine : classique chic')],
      ['khaki', 'white', L('Khaki & white: crisp', 'Kaki & blanc : net')],
      ['khaki', 'black', L('Khaki & black: utility street', 'Kaki & noir : street utilitaire')],
      ['khaki', 'brown', L('Khaki & brown: earthy', 'Kaki & marron : terreux')],
      ['cream', 'navy', L('Cream & navy: soft contrast', 'Crème & marine : contraste doux')],
      ['cream', 'brown', L('Cream & brown: warm and refined', 'Crème & marron : chaleureux et raffiné')],
      ['cream', 'black', L('Cream & black: sharp', 'Crème & noir : tranché')],
      ['brown', 'white', L('Brown & white: fresh and grounded', 'Marron & blanc : frais et ancré')],
      ['brown', 'beige', L('Brown & beige: tonal earth', 'Marron & beige : camaïeu terreux')],
      ['black', 'beige', L('Black & beige: clean street', 'Noir & beige : street épuré')],
      ['grey', 'white', L('Grey & white: easy', 'Gris & blanc : facile')],
      ['sand', 'white', L('Sand & white: light and soft', 'Sable & blanc : léger et doux')],
      ['sand', 'brown', L('Sand & chocolate: warm earth', 'Sable & chocolat : terre chaude')],
      ['sand', 'navy', L('Sand & navy: relaxed tailoring', 'Sable & marine : tailoring détendu')],
      ['sand', 'black', L('Sand & black: clean street', 'Sable & noir : street épuré')],
      ['taupe', 'cream', L('Taupe & cream: soft tonal', 'Taupe & crème : ton sur ton doux')],
      ['taupe', 'black', L('Taupe & black: understated', 'Taupe & noir : sobre')],
      ['taupe', 'navy', L('Taupe & navy: quiet contrast', 'Taupe & marine : contraste discret')],
      ['taupe', 'white', L('Taupe & white: fresh neutral', 'Taupe & blanc : neutre et frais')]
    ],
    /* Trios complets reconnus (les trois couleurs présentes dans la tenue). */
    trios: [
      ['navy', 'white', 'burgundy', L('Navy, white & burgundy: the timeless trio', 'Marine, blanc & bordeaux : le trio intemporel')],
      ['lightblue', 'white', 'brown', L('Light blue, white & brown: fresh and grounded', 'Bleu clair, blanc & marron : frais et ancré')],
      ['olive', 'white', 'brown', L('Olive, white & brown: casual done right', 'Olive, blanc & marron : le décontracté réussi')],
      ['olive', 'cream', 'brown', L('Olive, cream & brown: earthy summer', 'Olive, crème & marron : été terreux')],
      ['camel', 'navy', 'white', L('Camel, navy & white: polished', 'Camel, marine & blanc : soigné')],
      ['grey', 'black', 'white', L('Grey, black & white: modern monochrome', 'Gris, noir & blanc : monochrome moderne')],
      ['charcoal', 'burgundy', 'grey', L('Charcoal, burgundy & grey: deep and refined', 'Anthracite, bordeaux & gris : profond et raffiné')],
      ['beige', 'olive', 'white', L('Beige, olive & white: relaxed earth tones', 'Beige, olive & blanc : tons terre détendus')],
      ['denim', 'white', 'camel', L('Denim, white & camel: weekend classic', 'Denim, blanc & camel : classique du week-end')],
      ['black', 'cream', 'brown', L('Black, cream & brown: smart street', 'Noir, crème & marron : street chic')],
      ['navy', 'khaki', 'brown', L('Navy, khaki & brown: classic smart casual', 'Marine, kaki & marron : smart casual classique')],
      ['white', 'black', 'beige', L('White, black & beige: clean street', 'Blanc, noir & beige : street épuré')]
    ],
    /* Chaussures selon la couleur du bas. good = recommandé, ok = passe en casual, avoid = à éviter. */
    shoes: {
      navy: { good: ['brown', 'camel', 'burgundy', 'black'], ok: ['white', 'grey'] },
      grey: { good: ['black', 'brown', 'burgundy'], ok: ['white', 'grey', 'navy'] },
      charcoal: { good: ['black', 'burgundy', 'brown'], ok: ['white', 'grey'] },
      beige: { good: ['brown', 'camel', 'burgundy', 'navy'], ok: ['white', 'grey'], avoid: ['black'] },
      cream: { good: ['brown', 'camel', 'burgundy', 'navy'], ok: ['white', 'grey'], avoid: ['black'] },
      camel: { good: ['brown', 'burgundy', 'navy'], ok: ['white'], avoid: ['black'] },
      black: { good: ['black'], ok: ['white', 'grey', 'charcoal'], avoid: ['brown', 'camel'] },
      denim: { good: ['brown', 'white', 'black', 'camel'], ok: ['grey', 'navy', 'burgundy'] },
      olive: { good: ['brown', 'camel', 'white'], ok: ['black', 'burgundy'] },
      brown: { good: ['brown', 'camel', 'white'], ok: ['burgundy'], avoid: ['black'] },
      white: { good: ['brown', 'camel', 'navy', 'white'], ok: ['grey'] },
      lightblue: { good: ['brown', 'white', 'camel'], ok: ['navy'] },
      khaki: { good: ['brown', 'burgundy', 'navy'], ok: ['white', 'black'] },
      sand: { good: ['brown', 'burgundy', 'navy'], ok: ['white', 'black'] },
      taupe: { good: ['black', 'brown'], ok: ['white', 'navy'] }
    }
  };
})();
