import { publicPath } from "@/content/packet";

export type GalleryKind = "painting" | "sculpture" | "exhibit";

export type GalleryForm = "figure" | "mask" | "blade" | "case";

export type GalleryWall = "north" | "east" | "south" | "west";

/** Edit this list before upload. The room is built from it. */
export type GalleryItem = {
  id: string;
  kind: GalleryKind;
  title: string;
  credit: string;
  year: string;
  detail: string;
  wall: GalleryWall;
  /** 0–1, left to right along that wall. */
  along: number;
  image?: string;
  form?: GalleryForm;
};

export const gallery: GalleryItem[] = [
  {
    id: "laurie",
    kind: "painting",
    title: "Laurie",
    credit: "Jamie Lee Curtis",
    year: "1978",
    wall: "north",
    along: 0.28,
    image: publicPath("/portraits/jamie-lee-curtis.jpg"),
    detail:
      "Placeholder plate for the feature debut as Laurie Strode in John Carpenter’s Halloween, before True Lies, Freaky Friday, and the Academy Award for Everything Everywhere All at Once.",
  },
  {
    id: "billy",
    kind: "painting",
    title: "Billy Nolan",
    credit: "John Travolta",
    year: "1976",
    wall: "north",
    along: 0.72,
    image: publicPath("/portraits/john-travolta.jpg"),
    detail:
      "Placeholder plate for one of the first feature appearances, as Billy Nolan in Brian De Palma’s Carrie, before Saturday Night Fever, Grease, and Pulp Fiction.",
  },
  {
    id: "the-shape",
    kind: "sculpture",
    title: "The Shape",
    credit: "Gallery placeholder",
    year: "—",
    wall: "north",
    along: 0.5,
    form: "figure",
    detail:
      "A standing silhouette for the floor. Swap the form, the title, and this note in the gallery list. It is not a finished sculpture.",
  },
  {
    id: "alice",
    kind: "painting",
    title: "Alice",
    credit: "Brooke Shields",
    year: "1976",
    wall: "east",
    along: 0.3,
    image: publicPath("/portraits/brooke-shields.jpg"),
    detail:
      "Placeholder plate for Alfred Sole’s Alice, Sweet Alice, also released as Communion, before The Blue Lagoon and Endless Love.",
  },
  {
    id: "parasite",
    kind: "painting",
    title: "Parasite",
    credit: "Demi Moore",
    year: "1982",
    wall: "east",
    along: 0.7,
    image: publicPath("/portraits/demi-moore.jpg"),
    detail:
      "Placeholder plate for Charles Band’s 1982 science-fiction horror film Parasite — not the later, unrelated feature of the same name — before Ghost, Indecent Proposal, and G.I. Jane.",
  },
  {
    id: "mask",
    kind: "sculpture",
    title: "White Mask",
    credit: "Gallery placeholder",
    year: "—",
    wall: "east",
    along: 0.5,
    form: "mask",
    detail:
      "A mask on a pedestal, standing in for a prop from the horror credit that starts a career. Replace it in the gallery list before upload.",
  },
  {
    id: "vilmer",
    kind: "painting",
    title: "Vilmer",
    credit: "Matthew McConaughey",
    year: "1994",
    wall: "south",
    along: 0.28,
    image: publicPath("/portraits/matthew-mcconaughey.jpg"),
    detail:
      "Placeholder plate for Texas Chainsaw Massacre: The Next Generation, before Mud, Dallas Buyers Club, and Interstellar.",
  },
  {
    id: "jenny",
    kind: "painting",
    title: "Jenny",
    credit: "Renée Zellweger",
    year: "1994",
    wall: "south",
    along: 0.72,
    image: publicPath("/portraits/renee-zellweger.jpg"),
    detail:
      "Placeholder plate for the same picture, alongside Matthew McConaughey, before Jerry Maguire, Bridget Jones’s Diary, Chicago, Cold Mountain, and the Academy Award for Judy.",
  },
  {
    id: "blade",
    kind: "sculpture",
    title: "The Blade",
    credit: "Gallery placeholder",
    year: "—",
    wall: "south",
    along: 0.5,
    form: "blade",
    detail:
      "A blade on a low stand. Subject-appropriate stand-in only. Change the form field in the gallery list to figure, mask, blade, or case.",
  },
  {
    id: "tommy",
    kind: "painting",
    title: "Tommy Doyle",
    credit: "Paul Rudd",
    year: "1995",
    wall: "west",
    along: 0.24,
    image: publicPath("/portraits/paul-rudd.jpg"),
    detail:
      "Placeholder plate for Tommy Doyle in Halloween: The Curse of Michael Myers, before I Love You, Man, Ant-Man, and Sausage Party.",
  },
  {
    id: "silent-house",
    kind: "painting",
    title: "Silent House",
    credit: "Elizabeth Olsen",
    year: "2011",
    wall: "west",
    along: 0.5,
    image: publicPath("/portraits/elizabeth-olsen.jpg"),
    detail:
      "Placeholder plate for the thriller Silent House, before Wanda Maximoff.",
  },
  {
    id: "burning",
    kind: "painting",
    title: "The Burning",
    credit: "Jason Alexander",
    year: "1981",
    wall: "west",
    along: 0.62,
    image: publicPath("/portraits/jason-alexander.jpg"),
    detail:
      "Placeholder plate for the cult slasher The Burning, before Jason Alexander became George Costanza on Seinfeld.",
  },
  {
    id: "registration",
    kind: "exhibit",
    title: "Registration",
    credit: "Trancas International Films",
    year: "WGA No. 2310392",
    wall: "west",
    along: 0.78,
    image: publicPath("/plates/archive.jpg"),
    form: "case",
    detail:
      "A case for the registration and the packet. The image, the year line, and this note are placeholders to swap before upload.",
  },
];
