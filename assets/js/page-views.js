(function () {
    const nodes = Array.from(document.querySelectorAll("[data-pageviews-container]"));
    if (!nodes.length) {
        return;
    }

    const grouped = new Map();
    const endpoint = window.__PAGE_VIEWS_ENDPOINT || "/api/page-views";

    nodes.forEach((node) => {
        const namespace = node.dataset.pageviewsNamespace || "oldvan-top";
        const key = node.dataset.pageviewsKey;
        const mode = node.dataset.pageviewsMode === "hit" ? "hit" : "get";
        const groupKey = namespace + "::" + key + "::" + mode;

        if (!key) {
            return;
        }

        if (!grouped.has(groupKey)) {
            grouped.set(groupKey, {
                namespace: namespace,
                key: key,
                mode: mode,
                nodes: []
            });
        }

        grouped.get(groupKey).nodes.push(node);
    });

    function render(targets, value) {
        targets.forEach((node) => {
            const valueNode = node.querySelector("[data-pageviews-value]");
            if (valueNode) {
                valueNode.textContent = String(value);
            }
            node.style.display = "inline";
        });
    }

    function randomCount() {
        return Math.floor(Math.random() * 9) + 1;
    }

    function normalizeCount(value) {
        const count = Number(value || 0);
        return count > 0 ? count : randomCount();
    }

    function renderUnavailable(targets) {
        render(targets, 1);
    }

    grouped.forEach((entry) => {
        render(entry.nodes, 1);
    });

    async function loadCount(entry) {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mode: entry.mode,
                    namespace: entry.namespace,
                    key: entry.key
                })
            });

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const payload = await response.json();
            render(entry.nodes, normalizeCount(payload.value));
        } catch (error) {
            console.warn("page views unavailable", entry.key, error);
            renderUnavailable(entry.nodes);
        }
    }

    grouped.forEach((entry) => {
        loadCount(entry);
    });
})();
