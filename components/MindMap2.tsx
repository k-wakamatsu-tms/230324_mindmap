import React, { useEffect, useRef, useState } from "react";
import { PostNode } from "../lib/post";
import am4core from "@amcharts/amcharts4/core";
import am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const addChildToNode = (node, newNodeName) => {
  if (!node.children) {
    node.children = [];
  }

  node.children.push({
    name: newNodeName,
    children: [],
  });
};

export default function OrgChartTree() {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState(null);
  const [treeData, setTreeData] = useState([
    { name: "Press the button above!" },
  ]);
  const treeContainer = useRef(null);

  useEffect(() => {
    if (treeContainer.current) {
      const dimensions = treeContainer.current.getBoundingClientRect();
      setTranslate({ x: dimensions.width / 2, y: dimensions.height / 2 });
    }
  }, [treeContainer]);

  const separation = {
    siblings: 1,
    nonSiblings: 1,
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const dx = e.clientX - lastMousePosition.x;
      const dy = e.clientY - lastMousePosition.y;

      setTranslate((prevTranslate) => ({
        x: prevTranslate.x + dx,
        y: prevTranslate.y + dy,
      }));

      setLastMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleNodeClick = (node) => {
    const newNodeName = prompt("Enter the name for the new child node:");
    if (newNodeName) {
      const updatedTreeData = JSON.parse(JSON.stringify(treeData));
      addChildToNode(node, newNodeName);
      setTreeData(updatedTreeData);
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [question, setQuestion] = useState<string>(
    "チャット GPT の使い方、初心者向けに優しく解説する"
  );

  function parseJSON(obj) {
    try {
      // 最初と最後の文字が同じ「'」または「"」であれば削除する
      const firstChar = obj.charAt(0);
      const lastChar = obj.charAt(obj.length - 1);
      if (
        (firstChar === "'" && lastChar === "'") ||
        (firstChar === '"' && lastChar === '"')
      ) {
        obj = obj.slice(1, -1);
      }
      const replacedString = obj.replace(/`/g, "");

      // 最初の「{」の前の文字列を削除する
      const braceIndex = replacedString.indexOf("{");
      const formattedString = replacedString.slice(braceIndex);
      const formattedJson = JSON.parse(formattedString);
      return formattedJson;
    } catch (e) {
      console.log("error : ", e);
      return null;
    }
  }

  useEffect(() => {
    let chart = am4core.create(
      "chartdiv",
      am4plugins_forceDirected.ForceDirectedTree
    );
    chart.data = treeData;

    // let nodeTemplate = chart.nodes.template;
    // nodeTemplate.label.text = "{name}";
    // nodeTemplate.label.valign = "bottom";
    // nodeTemplate.label.dy = 10;
    // nodeTemplate.tooltipText = "{name}";
    // nodeTemplate.fillOpacity = 1;

    // let linkTemplate = chart.links.template;
    // linkTemplate.strokeWidth = 2;
    // linkTemplate.strokeOpacity = 0.5;

    // chart.legend = new am4core.Empty

    // chart.maxLevels = 2;
    chart.fontSize = 10;
    // chart.centerStrength = 0.5;
    // chart.linksDistance = 1;
    // chart.nodes.template.expandAll = false;
    // chart.nodes.template.collapsed = false;
    chart.zoomOutButton.disabled = true;
    // chart.homeZoomLevel = 2;
    // chart.homeAngle = 90;
    // chart.minRadius = 15;
    // chart.maxRadius = 20;
    chart.colors.step = 3;

    chart.events.on("ready", () => {
      setIsReady(true);
    });

    return () => {
      chart.dispose();
    };
  }, [treeData]);

  async function onSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await PostNode("/api/generate", { text: question });
      const newData = parseJSON(res.content);
      setResult(String(res.content));
      if (newData) {
        setTreeData(newData);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
    setIsLoading(false);
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="px-2 md:px-4 my-5">
          <input
            type="text"
            className="form-control mb-4"
            name="question"
            placeholder="質問"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div>
          {!isLoading ? (
            <div className="flex justify-center mt-">
              <button
                type="submit"
                className="w-24 bg-main bg-main-hover text-white text-lg font-bold py-1 rounded transition"
              >
                Generate
              </button>
            </div>
          ) : (
            <div className="mt-">
              <div className="loader text-main"></div>
            </div>
          )}
        </div>
      </form>
      <div
        className="w-full h-screen"
        id="chartdiv"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isReady && (
          <div className="flex items-center justify-center h-full">
            <p>No data found.</p>
          </div>
        )}
      </div>
    </>
  );
}
