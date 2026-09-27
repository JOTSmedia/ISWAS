export function publicPath(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

export type Star = {
  name: string;
  origin: string;
  body: string;
  image: string;
};

export type Comp = {
  title: string;
  short: string;
  meta: string;
  blurb: string;
};

export const logline =
  "Nine actors whose careers began with a horror credit, in sit-down interviews, with archive of the films and of the work that followed. Not a hosted tour of the genre.";

export const need = {
  lede: "Horror’s run in theaters, on home video, and in merchandising has not been matched.",
  paragraphs: [
    "No genre has matched horror’s run across theatrical exhibition, home video, and merchandising. Boutique labels in both video and apparel have pulled landmark films, and titles once left in obscurity, back into circulation. Those works have found new audiences without losing the people who were there first.",
    "Interest in the stories behind these films and series has not let up. The people in a position to tell them are the ones who made the work, and who went on to build distinguished careers of their own.",
  ],
};

export const starsIntro =
  "Nine careers that began with a horror credit — before the awards, the franchises, and the household names.";

export const stars: Star[] = [
  {
    name: "Jamie Lee Curtis",
    origin: "Halloween (1978)",
    image: publicPath("/portraits/jamie-lee-curtis.jpg"),
    body: "Before True Lies, Freaky Friday, and her Academy Award for Everything Everywhere All at Once, Jamie Lee Curtis made her feature debut as Laurie Strode in John Carpenter’s Halloween.",
  },
  {
    name: "John Travolta",
    origin: "Carrie (1976)",
    image: publicPath("/portraits/john-travolta.jpg"),
    body: "Before Saturday Night Fever, Grease, and Pulp Fiction, John Travolta made one of his first feature appearances as Billy Nolan in Brian De Palma’s Carrie.",
  },
  {
    name: "Brooke Shields",
    origin: "Alice, Sweet Alice (1976)",
    image: publicPath("/portraits/brooke-shields.jpg"),
    body: "Before The Blue Lagoon and Endless Love, Brooke Shields appeared in Alfred Sole’s cult horror film Alice, Sweet Alice, also released as Communion.",
  },
  {
    name: "Matthew McConaughey",
    origin: "Texas Chainsaw Massacre: The Next Generation (1994)",
    image: publicPath("/portraits/matthew-mcconaughey.jpg"),
    body: "Before Mud, Dallas Buyers Club, and Interstellar, Matthew McConaughey starred in Texas Chainsaw Massacre: The Next Generation.",
  },
  {
    name: "Paul Rudd",
    origin: "Halloween: The Curse of Michael Myers (1995)",
    image: publicPath("/portraits/paul-rudd.jpg"),
    body: "Before I Love You, Man, Ant-Man, and Sausage Party, Paul Rudd played Tommy Doyle in Halloween: The Curse of Michael Myers.",
  },
  {
    name: "Renée Zellweger",
    origin: "Texas Chainsaw Massacre: The Next Generation (1994)",
    image: publicPath("/portraits/renee-zellweger.jpg"),
    body: "Before Jerry Maguire, Bridget Jones’s Diary, an Academy Award nomination for Chicago, Cold Mountain, and her Academy Award for Judy, Renée Zellweger starred alongside Matthew McConaughey in Texas Chainsaw Massacre: The Next Generation.",
  },
  {
    name: "Elizabeth Olsen",
    origin: "Silent House (2011)",
    image: publicPath("/portraits/elizabeth-olsen.jpg"),
    body: "Before she played Wanda Maximoff, Elizabeth Olsen starred in the thriller Silent House.",
  },
  {
    name: "Demi Moore",
    origin: "Parasite (1982)",
    image: publicPath("/portraits/demi-moore.jpg"),
    body: "Before Ghost, Indecent Proposal, and G.I. Jane, Demi Moore starred in Parasite — Charles Band’s 1982 science-fiction horror film, not the later, unrelated feature of the same name.",
  },
  {
    name: "Jason Alexander",
    origin: "The Burning (1981)",
    image: publicPath("/portraits/jason-alexander.jpg"),
    body: "Before he became a household name as George Costanza on Seinfeld, Jason Alexander appeared in the cult slasher The Burning.",
  },
];

export const form = {
  lede: "The subject is what the talent says. The rest of the picture supports that conversation.",
  paragraphs: [
    "This is not built as a host’s tour of the genre, and it is not built on reenactment. The picture is carried by sit-down interviews and by archival material: the films that started these careers, and the careers that followed, in the words of the people who lived both.",
  ],
  principles: [
    {
      title: "Sit-down interviews",
      body: "What the talent discusses is the scene. The interview is the record, not a bridge to another format.",
    },
    {
      title: "Archive in support",
      body: "Archival material carries memory, context, and the work itself. It does not replace the person speaking.",
    },
    {
      title: "The horror credit is the start",
      body: "The horror credit is where the story starts. It is not asked to be the whole career, or the whole film.",
    },
  ],
};

export const compsIntro =
  "The audience for serious horror nonfiction is already on the record. These series, on AMC and on Shudder, are the comparison set in the preliminary packet.";

export const compsDistinction =
  "Those series showed that viewers will watch for the history, the craft, and the people behind the films. ";

export const comps: Comp[] = [
  {
    title: "Eli Roth’s History of Horror",
    short: "History of Horror",
    meta: "AMC · Three seasons · 2018–2021",
    blurb:
      "A hosted survey of the genre’s cycles, subgenres, and the filmmakers who made them.",
  },
  {
    title: "Cursed Films",
    short: "Cursed Films",
    meta: "Shudder · Two seasons · 2020–2022",
    blurb:
      "Production histories of films shadowed by accident, tragedy, and the stories that outlived the set.",
  },
  {
    title: "Horror Noire: A History of Black Horror",
    short: "Horror Noire",
    meta: "Shudder · 2019",
    blurb:
      "A documentary history of Black horror, told by the artists who shaped it.",
  },
  {
    title: "The Core",
    short: "The Core",
    meta: "Shudder · Series · 2017",
    blurb:
      "Mickey Keating’s Shudder series on how fear is built — technique, psychology, and the people in the room. Ten episodes, from 2017.",
  },
  {
    title: "Queer for Fear: The History of Queer Horror",
    short: "Queer for Fear",
    meta: "Shudder · Miniseries · 2022",
    blurb:
      "A four-part history of queer horror, from the gothic novel to the films that kept that history in plain sight.",
  },
  {
    title: "The 101 Scariest Horror Movie Moments of All Time",
    short: "The 101 Scariest",
    meta: "Shudder · Miniseries · 2022",
    blurb:
      "A clip-driven survey of the moments audiences still cannot shake, argued by people who make and study the genre.",
  },
];

export const contacts = [
  {
    name: "Malek Akkad",
    role: "Chief Executive Officer",
    email: "Malek@trancasfilms.com",
  },
  {
    name: "Ryan Freimann",
    role: "Vice President of Business Affairs",
    email: "Ryan@trancasfilms.com",
  },
];

export const address = {
  company: "Trancas International Films, Inc.",
  lines: ["2021 Pontius Avenue", "Los Angeles, California 90025"],
  phone: "310-477-6569",
  phoneHref: "tel:+13104776569",
};

export const marks = ["Trancas International", "Further Front", "Compass International Pictures"];

export const disclaimer = [
  "The confidential proprietary information contained in this document is privileged and only for the use of the intended recipient. The contents of this presentation may not be used, published, or redistributed without the prior written consent of an authorized representative of Trancas International Films, Inc.",
  "Statements and opinions expressed here are offered in good faith and based on the best available information. While every care has been taken in preparing these materials, Trancas International Films, Inc., and its subsidiaries or related entities, make no representations and give no warranties of any nature with respect to the contents. The directors, employees, and agents cannot be held liable for the use of, or reliance on, any opinions, estimates, forecasts, or findings in these materials.",
];
