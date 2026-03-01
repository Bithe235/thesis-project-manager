import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export interface Link {
    id: string;
    title: string;
    url: string;
    purpose: string;
    category: string;
    tags: string[];
    color: string;
    createdAt: string;
    author?: string;
}

const DATA_PATH = path.join(process.cwd(), "data", "links.json");

function ensureDataFile() {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_PATH)) {
        fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2), "utf-8");
    }
}

export function getLinks(): Link[] {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Link[];
}

export function addLink(link: Omit<Link, "id" | "createdAt">): Link {
    const links = getLinks();
    const newLink: Link = {
        ...link,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
    };
    links.push(newLink);
    fs.writeFileSync(DATA_PATH, JSON.stringify(links, null, 2), "utf-8");
    return newLink;
}

export function deleteLink(id: string): boolean {
    const links = getLinks();
    const filtered = links.filter((l) => l.id !== id);
    if (filtered.length === links.length) return false;
    fs.writeFileSync(DATA_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
}

export function updateLink(id: string, updates: Partial<Omit<Link, "id" | "createdAt">>): Link | null {
    const links = getLinks();
    const idx = links.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    links[idx] = { ...links[idx], ...updates };
    fs.writeFileSync(DATA_PATH, JSON.stringify(links, null, 2), "utf-8");
    return links[idx];
}

export const LINK_COLORS = [
    "#FFE135", "#FF6B9D", "#4ECDC4", "#95E16A",
    "#FF8C42", "#A855F7", "#FF4757", "#3B82F6",
    "#10B981", "#F59E0B",
];

export const LINK_CATEGORIES = [
    "Research", "Reference", "Tool", "Documentation",
    "Dataset", "Resource", "Communication", "Other",
];
