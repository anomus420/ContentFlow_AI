import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  agentId: string;
  name: string;
  domain: string;
  voiceRules: string;
  createdAt: Date;
}

export interface IPost extends Document {
  postId: string;
  agentId: string;
  text: string;
  rationale: string;
  sources: string[];
  keywords: string[];
  createdAt: Date;
}

export interface ISeenTopic extends Document {
  agentId: string;
  url: string;
  title: string;
  seenAt: Date;
}

export interface IRejection extends Document {
  rejectionId: string;
  agentId: string;
  title: string;
  url: string;
  reason: string;
  createdAt: Date;
}

const AgentSchema = new Schema<IAgent>({
  agentId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  domain: { type: String, required: true },
  voiceRules: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new Schema<IPost>({
  postId: { type: String, required: true, unique: true, index: true },
  agentId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  rationale: { type: String, required: true },
  sources: { type: [String], default: [] },
  keywords: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const SeenTopicSchema = new Schema<ISeenTopic>({
  agentId: { type: String, required: true, index: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  seenAt: { type: Date, default: Date.now }
});

const RejectionSchema = new Schema<IRejection>({
  rejectionId: { type: String, required: true, unique: true },
  agentId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Agent = mongoose.model<IAgent>('Agent', AgentSchema);
export const Post = mongoose.model<IPost>('Post', PostSchema);
export const SeenTopic = mongoose.model<ISeenTopic>('SeenTopic', SeenTopicSchema);
export const Rejection = mongoose.model<IRejection>('Rejection', RejectionSchema);
