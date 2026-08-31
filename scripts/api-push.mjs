// Push local commits to GitHub via API (git protocol blocked by proxy in this environment).
// Auto-detects base commit: first local commit whose TREE matches the remote head's tree,
// so remote history rebuilt by earlier API pushes never breaks the mapping.
//
// Usage:
//   GH_TOKEN=ghp_xxx node scripts/api-push.mjs [local-base-ref]   # base optional
// Env: GH_TOKEN (required), REPO (default vonsyan1998LLM/StackHK13), BRANCH (default main)
import { execSync, execFileSync } from "node:child_process";

const REPO = process.env.REPO || "vonsyan1998LLM/StackHK13";
const BRANCH = process.env.BRANCH || "main";
const GITCWD = "D:/web/StackHK13";
const H = { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" };
const api = async (path, method = "GET", body) => {
  const r = await fetch(`https://api.github.com/repos/${REPO}${path}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json();
  if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${j.message}`);
  return j;
};
// execFileSync with array args: no shell quoting issues (Windows cmd eats ^, mangles UTF-8 paths)
const git = (args) => execFileSync("git", ["-c", "core.quotepath=false", ...args], { encoding: "utf8", cwd: GITCWD }).trim();

const remoteHead = (await api(`/git/ref/heads/${BRANCH}`)).object.sha;
const remoteTree = (await api(`/commits/${remoteHead}`)).commit.tree.sha;

// base: explicit arg, else first local commit (walking back from HEAD) whose tree == remote tree
let baseCommit = process.argv[2] || null;
if (!baseCommit) {
  for (const c of git(["rev-list", "--max-count=30", "HEAD"]).split("\n")) {
    const t = (git(["cat-file", "-p", c]).match(/^tree ([0-9a-f]{40})/m) || [])[1];
    if (t === remoteTree) { baseCommit = c; break; }
  }
}
if (!baseCommit) throw new Error("no local commit matches remote tree — inspect divergence manually");
const commits = git(["rev-list", "--reverse", `${baseCommit}..HEAD`]).split("\n");
console.log(`base: local ${baseCommit.slice(0, 7)} (tree == remote ${remoteHead.slice(0, 7)}); ${commits.length} commit(s) to push`);

let parentCommit = remoteHead;
let parentTree = remoteTree;
for (const c of commits) {
  const msg = git(["log", "-1", "--format=%B", c]);
  const changes = git(["diff-tree", "--no-commit-id", "--name-status", "-r", c]).split("\n").map((l) => l.split("\t"));
  const entries = [];
  for (const [status, path] of changes) {
    if (status === "D") { entries.push({ path, mode: "100644", type: "blob", sha: null }); continue; }
    const content = execFileSync("git", ["show", `${c}:${path}`], { cwd: GITCWD, maxBuffer: 128 * 1024 * 1024 });
    const blob = await api("/git/blobs", "POST", { content: content.toString("base64"), encoding: "base64" });
    entries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const tree = await api("/git/trees", "POST", { base_tree: parentTree, tree: entries });
  const commit = await api("/git/commits", "POST", { message: msg, tree: tree.sha, parents: [parentCommit] });
  console.log(`pushed ${c.slice(0, 7)} -> ${commit.sha.slice(0, 7)} (${changes.length} files)`);
  parentCommit = commit.sha; parentTree = tree.sha;
}
await api(`/git/refs/heads/${BRANCH}`, "PATCH", { sha: parentCommit, force: false });
console.log(`ref ${BRANCH} updated -> ${parentCommit.slice(0, 7)}`);
