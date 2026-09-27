export type ShelfVolume = {
  id: string;
  title: string;
  label: string;
  credit: string;
  year: string;
  detail: string;
  color: string;
  x: number;
  y: number;
};

/** Public-domain shelf copies. Openings are the published text; the rest of each card says where the full book lives. */
export const CATALOG: ShelfVolume[] = [
  {
    id: "vol-frankenstein",
    title: "Frankenstein",
    label: "FRANKENSTEIN",
    credit: "Mary Shelley · Project Gutenberg",
    year: "1818",
    color: "#1a120e",
    x: -22,
    y: 0.62,
    detail:
      "You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking. The full text is the Project Gutenberg edition of Frankenstein; or, The Modern Prometheus.",
  },
  {
    id: "vol-dracula",
    title: "Dracula",
    label: "DRACULA",
    credit: "Bram Stoker · Project Gutenberg",
    year: "1897",
    color: "#3d1218",
    x: -18,
    y: 0.62,
    detail:
      "3 May. Bistritz.—Left Munich at 8:35 P. M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place. The full text is the Project Gutenberg edition of Dracula.",
  },
  {
    id: "vol-carmilla",
    title: "Carmilla",
    label: "CARMILLA",
    credit: "J. Sheridan Le Fanu · Project Gutenberg",
    year: "1872",
    color: "#241018",
    x: -14,
    y: 0.62,
    detail:
      "In Styria, we, though by no means magnificent people, inhabit a castle, or schloss. A small income, in that part of the world, goes a great way. The full text is the Project Gutenberg edition of Carmilla, from In a Glass Darkly.",
  },
  {
    id: "vol-heart",
    title: "The Tell-Tale Heart",
    label: "TELL-TALE",
    credit: "Edgar Allan Poe · Project Gutenberg",
    year: "1843",
    color: "#14181c",
    x: -10,
    y: 0.62,
    detail:
      "True!—nervous—very, very dreadfully nervous I had been and am; but why will you say that I am mad? The disease had sharpened my senses—not destroyed—not dulled them. Above all was the sense of hearing acute. The full text is the Project Gutenberg edition of Poe’s short stories.",
  },
  {
    id: "vol-otranto",
    title: "The Castle of Otranto",
    label: "OTRANTO",
    credit: "Horace Walpole · Project Gutenberg",
    year: "1764",
    color: "#2a2218",
    x: -6,
    y: 0.62,
    detail:
      "Manfred, Prince of Otranto, had one son and one daughter: the latter, a most beautiful virgin, aged eighteen, was called Matilda. Conrad, the son, was three years younger, a homely youth, sickly, and of no promising disposition. The full text is the Project Gutenberg edition of the first Gothic novel.",
  },
  {
    id: "vol-screw",
    title: "The Turn of the Screw",
    label: "THE SCREW",
    credit: "Henry James · Project Gutenberg",
    year: "1898",
    color: "#1c1814",
    x: -2,
    y: 0.62,
    detail:
      "The story had held us, round the fire, sufficiently breathless, but except the obvious remark that it was gruesome, as, on Christmas Eve in an old house, a strange tale should essentially be, I remember no comment uttered till somebody happened to say that it was the only case he had met in which such a visitation had fallen on a child. The full text is the Project Gutenberg edition.",
  },
  {
    id: "vol-yellow",
    title: "The King in Yellow",
    label: "YELLOW",
    credit: "Robert W. Chambers · Project Gutenberg",
    year: "1895",
    color: "#4a3a12",
    x: 2,
    y: 0.62,
    detail:
      "Along the shore the cloud waves break, The twin suns sink behind the lake, The shadows lengthen in Carcosa. Strange is the night where black stars rise, And strange moons circle through the skies, But stranger still is Lost Carcosa. The full text is the Project Gutenberg edition of The King in Yellow.",
  },
  {
    id: "vol-paradise",
    title: "Paradise Lost",
    label: "PARADISE",
    credit: "John Milton · Project Gutenberg",
    year: "1667",
    color: "#2c1810",
    x: 6,
    y: 0.62,
    detail:
      "Of Man’s first disobedience, and the fruit of that forbidden tree whose mortal taste brought death into the World, and all our woe, with loss of Eden, till one greater Man restore us, and regain the blissful seat, sing, Heavenly Muse. The full text is the Project Gutenberg edition of Paradise Lost.",
  },
  {
    id: "vol-inferno",
    title: "Inferno",
    label: "INFERNO",
    credit: "Dante Alighieri · Longfellow translation",
    year: "1320",
    color: "#3a1414",
    x: 10,
    y: 0.62,
    detail:
      "Midway upon the journey of our life I found myself within a forest dark, for the straightforward pathway had been lost. Ah me! how hard a thing it is to say what was this forest savage, rough, and stern, which in the very thought renews the fear. Longfellow’s translation is in the public domain.",
  },
  {
    id: "vol-moby",
    title: "Moby-Dick",
    label: "MOBY-DICK",
    credit: "Herman Melville · Project Gutenberg",
    year: "1851",
    color: "#12161a",
    x: 14,
    y: 0.62,
    detail:
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. The full text is the Project Gutenberg edition of Moby-Dick.",
  },
  {
    id: "vol-pride",
    title: "Pride and Prejudice",
    label: "PRIDE",
    credit: "Jane Austen · Project Gutenberg",
    year: "1813",
    color: "#3a2a38",
    x: 18,
    y: 0.62,
    detail:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters. The full text is the Project Gutenberg edition.",
  },
  {
    id: "vol-cities",
    title: "A Tale of Two Cities",
    label: "TWO CITIES",
    credit: "Charles Dickens · Project Gutenberg",
    year: "1859",
    color: "#2a241c",
    x: 22,
    y: 0.62,
    detail:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness. The full text is the Project Gutenberg edition.",
  },
  {
    id: "vol-species",
    title: "On the Origin of Species",
    label: "SPECIES",
    credit: "Charles Darwin · Project Gutenberg",
    year: "1859",
    color: "#1a241c",
    x: -20,
    y: 1.22,
    detail:
      "When on board H.M.S. ‘Beagle,’ as naturalist, I was much struck with certain facts in the distribution of the inhabitants of South America, and in the geological relations of the present to the past inhabitants of that continent. These facts seemed to me to throw some light on the origin of species. The full text is the Project Gutenberg edition.",
  },
  {
    id: "vol-republic",
    title: "The Republic",
    label: "REPUBLIC",
    credit: "Plato · Jowett translation",
    year: "1888",
    color: "#1c1a16",
    x: -16,
    y: 1.22,
    detail:
      "I went down yesterday to the Piraeus with Glaucon the son of Ariston, that I might offer up my prayers to the goddess; and also because I wanted to see in what manner they would celebrate the festival, which was a new thing. Jowett’s translation is in the public domain.",
  },
  {
    id: "vol-odyssey",
    title: "The Odyssey",
    label: "ODYSSEY",
    credit: "Homer · Butler translation",
    year: "1900",
    color: "#243044",
    x: -12,
    y: 1.22,
    detail:
      "Tell me, O muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy. Many cities did he visit, and many were the nations with whose manners and customs he was acquainted. Butler’s translation is in the public domain.",
  },
  {
    id: "vol-beowulf",
    title: "Beowulf",
    label: "BEOWULF",
    credit: "Anonymous · Gummere translation",
    year: "1910",
    color: "#2a2018",
    x: -8,
    y: 1.22,
    detail:
      "Lo, praise of the prowess of people-kings of spear-armed Danes, in days long sped, we have heard, and what honor the athelings won. Gummere’s verse translation is in the public domain.",
  },
  {
    id: "vol-meditations",
    title: "Meditations",
    label: "MEDITATIONS",
    credit: "Marcus Aurelius · Long translation",
    year: "1862",
    color: "#2c2820",
    x: -4,
    y: 1.22,
    detail:
      "From my grandfather Verus I learned good morals and the government of my temper. From the reputation and remembrance of my father, modesty and a manly character. George Long’s translation is in the public domain.",
  },
  {
    id: "vol-art-of-war",
    title: "The Art of War",
    label: "ART OF WAR",
    credit: "Sun Tzu · Giles translation",
    year: "1910",
    color: "#3a1814",
    x: 0,
    y: 1.22,
    detail:
      "The art of war is of vital importance to the State. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected. Lionel Giles’s translation is in the public domain.",
  },
  {
    id: "vol-alice",
    title: "Alice’s Adventures in Wonderland",
    label: "ALICE",
    credit: "Lewis Carroll · Project Gutenberg",
    year: "1865",
    color: "#1a2830",
    x: 4,
    y: 1.22,
    detail:
      "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice, “without pictures or conversations?” The full text is the Project Gutenberg edition.",
  },
  {
    id: "vol-eb-library",
    title: "Library",
    label: "LIBRARY",
    credit: "Encyclopaedia Britannica, 11th edition",
    year: "1911",
    color: "#3a2c1c",
    x: 8,
    y: 1.22,
    detail:
      "Shelf volume of the 1911 Encyclopaedia Britannica. A library is a collection of books for use, as distinct from a mere accumulation, and the history of libraries is the history of that use: temple collections, monastic presses, the college long room, and the public reading room. The eleventh edition is in the public domain.",
  },
  {
    id: "vol-eb-vampire",
    title: "Vampire",
    label: "VAMPIRE",
    credit: "Encyclopaedia Britannica, 11th edition",
    year: "1911",
    color: "#4a1820",
    x: 12,
    y: 1.22,
    detail:
      "Shelf volume of the 1911 Encyclopaedia Britannica. The article treats the vampire as a corpse supposed to return from the grave and prey upon the living, tracing the belief through eastern Europe and into the literature that followed. The eleventh edition is in the public domain.",
  },
  {
    id: "vol-eb-gothic",
    title: "Gothic Architecture",
    label: "GOTHIC",
    credit: "Encyclopaedia Britannica, 11th edition",
    year: "1911",
    color: "#1e2430",
    x: 16,
    y: 1.22,
    detail:
      "Shelf volume of the 1911 Encyclopaedia Britannica. Gothic architecture is described through the pointed arch, the ribbed vault, and the flying buttress, from the twelfth-century Île-de-France outward across Europe. The eleventh edition is in the public domain.",
  },
  {
    id: "vol-eb-book",
    title: "Book",
    label: "THE BOOK",
    credit: "Encyclopaedia Britannica, 11th edition",
    year: "1911",
    color: "#2a2418",
    x: 20,
    y: 1.22,
    detail:
      "Shelf volume of the 1911 Encyclopaedia Britannica. The article follows the book from the rolled volumen to the folded codex, through manuscript, print, and binding, which is why it sits on this shelf as the volume about volumes. The eleventh edition is in the public domain.",
  },
];
