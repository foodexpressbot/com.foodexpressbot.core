import { UserOptions } from './user';
import { RankOptions } from './rank';
export interface KnowledgeBaseOptions {
    _id?: string;
    name?: string;
    tags?: string[];
    category?: string;
    information?: string;
    allowedRanks?: string[];
    createdBy?: string | UserOptions;
    createdAt?: number;
    updatedAt?: number;
}
export interface KnowledgeBaseCategoryOptions {
    _id?: string;
    name?: string;
    slug?: string;
    allowedRanks?: RankOptions[] | string[];
    articles?: KnowledgeBaseOptions[];
}
//# sourceMappingURL=knowledgeBase.d.ts.map