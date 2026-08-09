import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Agent, Post, SeenTopic, Rejection, IAgent, IPost, ISeenTopic, IRejection } from './models';

// In-Memory Fallback Stores when MongoDB service is not active locally
const memAgents = new Map<string, any>();
const memPosts: any[] = [];
const memSeenTopics = new Map<string, any>();
const memRejections: any[] = [];

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function dbCreateAgent(data: { agentId: string; name: string; domain: string; voiceRules: string }): Promise<any> {
  const doc = { ...data, createdAt: new Date() };
  if (isMongoConnected()) {
    try {
      return await Agent.create(doc);
    } catch (e) {
      console.warn('[DB Store] Mongoose write failed, using memory store fallback');
    }
  }
  memAgents.set(data.agentId, doc);
  return doc;
}

export async function dbFindAgent(agentId?: string): Promise<any> {
  if (isMongoConnected()) {
    try {
      if (agentId) {
        return await Agent.findOne({ agentId }).exec();
      } else {
        return await Agent.findOne().sort({ createdAt: -1 }).exec();
      }
    } catch (e) {
      // Fallback
    }
  }
  if (agentId) {
    return memAgents.get(agentId) || null;
  }
  const agents = Array.from(memAgents.values());
  return agents.length > 0 ? agents[agents.length - 1] : null;
}

export async function dbFindAllAgents(): Promise<any[]> {
  if (isMongoConnected()) {
    try {
      return await Agent.find().sort({ createdAt: -1 }).exec();
    } catch (e) {
      // Fallback
    }
  }
  return Array.from(memAgents.values());
}

export async function dbCreatePost(data: { postId: string; agentId: string; text: string; rationale: string; sources: string[]; keywords: string[] }): Promise<any> {
  const doc = { ...data, createdAt: new Date() };
  if (isMongoConnected()) {
    try {
      return await Post.create(doc);
    } catch (e) {
      console.warn('[DB Store] Mongoose write post failed, using memory store fallback');
    }
  }
  memPosts.unshift(doc);
  return doc;
}

export async function dbFindPosts(agentId: string, limit: number = 50): Promise<any[]> {
  if (isMongoConnected()) {
    try {
      return await Post.find({ agentId }).sort({ createdAt: -1 }).limit(limit).exec();
    } catch (e) {
      // Fallback
    }
  }
  return memPosts.filter(p => p.agentId === agentId).slice(0, limit);
}

export async function dbFilterSeenUrls(agentId: string, urls: string[]): Promise<Set<string>> {
  if (isMongoConnected()) {
    try {
      const records = await SeenTopic.find({ agentId, url: { $in: urls } }).exec();
      return new Set(records.map(s => s.url));
    } catch (e) {
      // Fallback
    }
  }
  const set = new Set<string>();
  for (const url of urls) {
    if (memSeenTopics.has(`${agentId}:${url}`)) {
      set.add(url);
    }
  }
  return set;
}

export async function dbAddSeenUrls(agentId: string, candidates: Array<{ url: string; title: string }>): Promise<void> {
  if (isMongoConnected()) {
    try {
      const docs = candidates.map(c => ({ agentId, url: c.url, title: c.title, seenAt: new Date() }));
      await SeenTopic.insertMany(docs, { ordered: false }).catch(() => {});
      return;
    } catch (e) {
      // Fallback
    }
  }
  for (const c of candidates) {
    memSeenTopics.set(`${agentId}:${c.url}`, { agentId, url: c.url, title: c.title, seenAt: new Date() });
  }
}

export async function dbCreateRejection(data: { rejectionId: string; agentId: string; title: string; url: string; reason: string }): Promise<any> {
  const doc = { ...data, createdAt: new Date() };
  if (isMongoConnected()) {
    try {
      return await Rejection.create(doc);
    } catch (e) {
      // Fallback
    }
  }
  memRejections.unshift(doc);
  return doc;
}

export async function dbFindRejections(agentId: string, limit: number = 100): Promise<any[]> {
  if (isMongoConnected()) {
    try {
      return await Rejection.find({ agentId }).sort({ createdAt: -1 }).limit(limit).exec();
    } catch (e) {
      // Fallback
    }
  }
  return memRejections.filter(r => r.agentId === agentId).slice(0, limit);
}
