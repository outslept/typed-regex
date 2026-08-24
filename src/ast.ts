import { parse } from "regjsparser";

export type StrictASTNode = {
  type:
    | "alternative"
    | "group"
    | "value"
    | "characterClass"
    | "quantifier"
    | "match"
    | "captureGroup"
    | "nonCaptureGroup";
  range: [number, number];
  raw: string;
  name?: string;
  body?: StrictASTNode | StrictASTNode[];
};

export function parseStrict(pattern: string): StrictASTNode {
  const ast = parse(pattern, "", { unicodePropertyEscape: true, namedGroups: true });
  return transformNode(ast);
}

function transformNode(node: any): StrictASTNode {
  const base: StrictASTNode = {
    type: node.type,
    range: [node.range[0], node.range[1]],
    raw: node.raw,
  };

  if (node.type === "group" && node.behavior === "normal") {
    base.type = "captureGroup";
  } else if (node.type === "group" && node.behavior === "ignore") {
    base.type = "nonCaptureGroup";
  }

  if (node.name) {
    base.name = node.name;
  }

  if (node.body) {
    base.body = Array.isArray(node.body) ? node.body.map(transformNode) : transformNode(node.body);
  }

  return base;
}
