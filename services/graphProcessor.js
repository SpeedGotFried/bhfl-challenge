const processGraph = (data) => {
    const invalid_entries = [];
    const duplicate_edges = [];
    const valid_edges = [];
    
    const edgeTracker = new Set();
    
    for (let i = 0; i < data.length; i++) {
        const raw = data[i];
        if (typeof raw !== 'string') {
            invalid_entries.push(raw);
            continue;
        }
        
        const trimmed = raw.trim();
        // Valid Node Format: X->Y where X and Y are each a single uppercase letter
        const regex = /^[A-Z]->[A-Z]$/;
        
        if (!regex.test(trimmed)) {
            invalid_entries.push(raw);
            continue;
        }
        
        const parts = trimmed.split('->');
        // Self-loops are invalid
        if (parts[0] === parts[1]) {
            invalid_entries.push(raw);
            continue;
        }
        
        if (edgeTracker.has(trimmed)) {
            if (!duplicate_edges.includes(trimmed)) {
                duplicate_edges.push(trimmed);
            }
        } else {
            edgeTracker.add(trimmed);
            valid_edges.push({ parent: parts[0], child: parts[1] });
        }
    }
    
    const childToParent = {};
    const childrenList = {};
    const nodes = new Set();
    
    for (let edge of valid_edges) {
        nodes.add(edge.parent);
        nodes.add(edge.child);
        
        if (childToParent[edge.child] !== undefined) {
            continue; // Multi-parent rule: silently discard
        }
        childToParent[edge.child] = edge.parent;
        
        if (!childrenList[edge.parent]) {
            childrenList[edge.parent] = [];
        }
        childrenList[edge.parent].push(edge.child);
    }
    
    const adj = {};
    const undirectedNodes = Array.from(nodes);
    for(let n of undirectedNodes) adj[n] = [];
    
    for (let c in childToParent) {
        let p = childToParent[c];
        adj[c].push(p);
        adj[p].push(c);
    }
    
    let visited = new Set();
    let groups = [];
    
    for (let node of undirectedNodes) {
        if (!visited.has(node)) {
            let group = [];
            let q = [node];
            visited.add(node);
            while(q.length > 0) {
                let curr = q.shift();
                group.push(curr);
                for(let neighbor of adj[curr]) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        q.push(neighbor);
                    }
                }
            }
            groups.push(group);
        }
    }
    
    const getRootOfGroup = (groupNodes) => {
        let possibleRoots = groupNodes.filter(n => childToParent[n] === undefined);
        if (possibleRoots.length > 0) {
            possibleRoots.sort();
            return possibleRoots[0];
        }
        groupNodes.sort();
        return groupNodes[0];
    };
    
    let hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root = null;
    let max_depth = -1;
    
    for (let group of groups) {
        let root = getRootOfGroup(group);
        
        let hasCycle = false;
        let state = {}; 
        for(let n of group) state[n] = 0;
        
        const checkCycle = (curr) => {
            state[curr] = 1;
            let children = childrenList[curr] || [];
            for (let child of children) {
                if (state[child] === 1) {
                    hasCycle = true;
                    return;
                } else if (state[child] === 0) {
                    checkCycle(child);
                }
            }
            state[curr] = 2;
        };
        
        for(let n of group) {
            if(state[n] === 0 && !hasCycle) {
                checkCycle(n);
            }
        }
        
        if (hasCycle) {
            hierarchies.push({
                root: root,
                tree: {},
                has_cycle: true
            });
            total_cycles++;
        } else {
            const buildTree = (curr) => {
                let obj = {};
                let children = childrenList[curr] || [];
                for(let child of children) {
                    obj[child] = buildTree(child);
                }
                return obj;
            };
            
            let treeObj = {};
            treeObj[root] = buildTree(root);
            
            const getDepth = (curr) => {
                let children = childrenList[curr] || [];
                if (children.length === 0) return 1;
                let maxChildDepth = 0;
                for(let child of children) {
                    maxChildDepth = Math.max(maxChildDepth, getDepth(child));
                }
                return 1 + maxChildDepth;
            };
            
            let depth = getDepth(root);
            
            hierarchies.push({
                root: root,
                tree: treeObj,
                depth: depth
            });
            total_trees++;
            
            if (depth > max_depth) {
                max_depth = depth;
                largest_tree_root = root;
            } else if (depth === max_depth) {
                if (largest_tree_root === null || root < largest_tree_root) {
                    largest_tree_root = root;
                }
            }
        }
    }
    
    hierarchies.sort((a,b) => a.root.localeCompare(b.root));

    return {
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root: largest_tree_root || ""
        }
    };
};

module.exports = {
    processGraph
};
