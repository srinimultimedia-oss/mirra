'use strict';

// Local hardening for the recursive AST walkers. Options cannot disable these
// limits. Parent/prev links are metadata; traverse only owned child nodes.
const MAX_DEPTH = 128;
const MAX_NODES = 65536;
function assertSafeAst(ast) {
  const pending = [[ast, 0, ast && ast.parent]];
  const seen = new Set();
  let count = 0;
  while (pending.length) {
    const [node, depth, parent] = pending.pop();
    if (!node || typeof node !== 'object' || depth > MAX_DEPTH ||
        seen.has(node) || ++count > MAX_NODES) {
      throw new RangeError('Brace AST exceeds safe depth/node limits or contains a cycle');
    }
    seen.add(node);
    if (node.parent && node.parent !== parent) throw new RangeError('Invalid brace AST parent');
    if (node.nodes !== undefined) {
      if (!Array.isArray(node.nodes) || node.nodes.length + pending.length + count > MAX_NODES) {
        throw new RangeError('Brace AST exceeds safe node limit');
      }
      for (const child of node.nodes) pending.push([child, depth + 1, node]);
    }
  }
}
module.exports = { MAX_DEPTH, MAX_NODES, assertSafeAst };
