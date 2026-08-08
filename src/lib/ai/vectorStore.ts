export type VectorDocument = {
  id: string;
  content: string;
  metadata: Record<string, string | number | boolean>;
};

export class FutureChromaStore {
  private documents: VectorDocument[] = [];

  async addDocuments(documents: VectorDocument[]) {
    this.documents = [...this.documents, ...documents];
    return documents.map((document) => document.id);
  }

  async similaritySearch(query: string, limit = 4) {
    const normalized = query.toLowerCase();
    return this.documents
      .filter((document) => document.content.toLowerCase().includes(normalized))
      .slice(0, limit);
  }
}
