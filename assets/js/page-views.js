(function () {
    const nodes = Array.from(document.querySelectorAll("[data-pageviews-container]"));
    if (!nodes.length) {
        return;
    }

    const grouped = new Map();

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

    async function loadCount(entry) {
        const endpoint = "https://api.countapi.xyz/" + entry.mode + "/" +
            encodeURIComponent(entry.namespace) + "/" + encodeURIComponent(entry.key);

        try {
            const response = await fetch(endpoint, {
                headers: {
                    Accept: "application/json"
                }
            });

            if (response.status === 404 && entry.mode === "get") {
                render(entry.nodes, 0);
                return;
            }

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const payload = await response.json();
            render(entry.nodes, payload.value || 0);
        } catch (error) {
            console.warn("page views unavailable", entry.key, error);
        }
    }

    grouped.forEach((entry) => {
        loadCount(entry);
    });
})();
