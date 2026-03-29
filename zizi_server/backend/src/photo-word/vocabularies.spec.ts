import { matchVocabulary, VOCABULARIES, BASIC_WORDS, PRAISE_WORDS } from './vocabularies';

describe('matchVocabulary', () => {
  describe('分级字库匹配', () => {
    it('Level 1: 应匹配字库中的单字', () => {
      const candidates = ['苹果', '水果'];
      // '果' 在 Level 1 字库中
      const result = matchVocabulary(candidates, 1);
      expect(VOCABULARIES[1].has(result)).toBe(true);
    });

    it('Level 2: 应匹配 Level 2 扩展字', () => {
      const candidates = ['跑得快'];
      // '跑' 在 Level 2 字库中但不在 Level 1
      const result = matchVocabulary(candidates, 2);
      expect(result).toBe('跑');
    });

    it('Level 3: 应匹配情感类字', () => {
      const candidates = ['勇敢'];
      // '勇' 在 Level 3 字库中
      const result = matchVocabulary(candidates, 3);
      expect(result).toBe('勇');
    });

    it('Level 4: 应匹配成语/抽象概念字', () => {
      const candidates = ['梦想'];
      // '梦' 在 Level 4 字库中
      const result = matchVocabulary(candidates, 4);
      expect(result).toBe('梦');
    });

    it('无效等级应降级为 Level 1', () => {
      const candidates = ['花盆'];
      const result = matchVocabulary(candidates, 99);
      expect(result).toBe('花'); // '花' 在 Level 1 中
    });
  });

  describe('降级匹配', () => {
    it('字库无匹配时应降级到 BASIC_WORDS', () => {
      // 用一个不在任何字库但包含基础字的词
      const candidates = ['大厦'];
      // '大' 在 BASIC_WORDS 中
      const result = matchVocabulary(candidates, 1);
      expect(BASIC_WORDS).toContain(result);
    });
  });

  describe('兜底匹配', () => {
    it('候选词完全无匹配时应返回赞美字', () => {
      // 用一个只含非常见字的候选词，确保不在任何字库
      const candidates = ['磁'];
      const result = matchVocabulary(candidates, 1);
      expect(PRAISE_WORDS).toContain(result);
    });
  });

  describe('边界输入', () => {
    it('空候选列表应返回赞美字', () => {
      const result = matchVocabulary([], 1);
      expect(PRAISE_WORDS).toContain(result);
    });

    it('空字符串候选应返回赞美字', () => {
      const result = matchVocabulary([''], 1);
      expect(PRAISE_WORDS).toContain(result);
    });

    it('应优先匹配第一个候选词中的字', () => {
      const candidates = ['花猫', '红色'];
      // '花' 在 Level 1 中，应该是第一个匹配
      const result = matchVocabulary(candidates, 1);
      expect(result).toBe('花');
    });

    it('多字候选应逐字匹配', () => {
      const candidates = ['桌子'];
      // '桌' 不在 Level 1，'子' 在 Level 1
      const result = matchVocabulary(candidates, 1);
      expect(result).toBe('子');
    });
  });

  describe('字库完整性', () => {
    it('Level 1 应包含基础身体部位字', () => {
      const l1 = VOCABULARIES[1];
      expect(l1.has('手')).toBe(true);
      expect(l1.has('口')).toBe(true);
      expect(l1.has('目')).toBe(true);
    });

    it('Level 1 应包含数字', () => {
      const l1 = VOCABULARIES[1];
      expect(l1.has('一')).toBe(true);
      expect(l1.has('十')).toBe(true);
    });

    it('Level 2 应包含动作字', () => {
      const l2 = VOCABULARIES[2];
      expect(l2.has('跑')).toBe(true);
      expect(l2.has('吃')).toBe(true);
    });

    it('Level 3 应包含情感字', () => {
      const l3 = VOCABULARIES[3];
      expect(l3.has('爱')).toBe(true);
      expect(l3.has('勇')).toBe(true);
    });

    it('Level 4 应包含抽象概念字', () => {
      const l4 = VOCABULARIES[4];
      expect(l4.has('梦')).toBe(true);
      expect(l4.has('创')).toBe(true);
    });
  });
});
