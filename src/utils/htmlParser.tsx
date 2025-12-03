import { createElement, CSSProperties, ReactNode, Fragment } from "react";
import { Settings } from "../types/Settings";
import { Styles } from "../types/Styles";

/**
 * Internal helper to parse HTML nodes recursively
 */
const parseHTMLNodes = (html: string, settings?: Settings, styles?: Styles): ReactNode[] => {
	const parser = new DOMParser();
	const parsedHtml = parser.parseFromString(html, "text/html");
	const nodes = Array.from(parsedHtml.body.childNodes);
  
	const renderNodes: ReactNode[] = nodes.map((node, index) => {
		if (node.nodeType === Node.TEXT_NODE) {
			return node.textContent;
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			const element = node as Element;
			const tagName = element.tagName?.toLowerCase();
			
			if (!tagName) {
				return null;
			}
			
			let attributes = Array.from(element.attributes).reduce((acc, attr) => {
				if (!attr.name) return acc;
				const attributeName = attr.name.toLowerCase();
				if (attributeName === "style") {
					const styleProperties = attr.value.split(";").filter(property => property.trim() !== "");
					const styleObject: { [key: string]: string } = {};
					styleProperties.forEach(property => {
						const [key, value] = property.split(":").map(part => part.trim());
						const reactCompliantKey = key.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
						styleObject[reactCompliantKey] = value;
					});
					acc[attributeName] = styleObject;
				} else if ((tagName === "audio" || tagName === "video")
					&& attributeName === "controls" && attr.value === "") {
					acc[attributeName] = "true";
				} else if (attributeName === "onclick") {
					// Option A: Convert inline onclick string to React onClick handler
					// WARNING: This uses Function constructor which can be a security risk with untrusted HTML
					try {
						// Create a function from the onclick string
						// The function receives 'event' as parameter
						const clickHandler = new Function('event', attr.value);
						acc["onClick"] = (e: React.MouseEvent) => {
							try {
								clickHandler.call(e.currentTarget, e);
							} catch (error) {
								console.error('[htmlParser] Error executing onclick handler:', error);
							}
						};
					} catch (error) {
						console.error('[htmlParser] Error parsing onclick attribute:', error);
					}
				} else {
					acc[attributeName] = attr.value;
				}
				return acc;
			}, {} as { [key: string]: string | CSSProperties | ((e: React.MouseEvent) => void) });

			// if have class property, rename to className instead
			if (Object.prototype.hasOwnProperty.call(attributes, "class")) {
				const classList = element.classList;
				attributes["className"] = classList.toString();
				delete attributes["class"];
			}

			const voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link",
				"meta", "source", "track", "wbr"];
			if (voidElements.includes(tagName)) {
				// void elements must not have children
				return createElement(tagName, { key: index, ...attributes });
			} else {
				const children = parseHTMLNodes(element.innerHTML, settings, styles);
				return createElement(tagName, { key: index, ...attributes }, ...children);
			}
		} else {
			// Skip other node types (comments, etc.)
			return null;
		}
	}).filter(Boolean);
  
	return renderNodes;
};

/**
 * Parses HTML string and converts it to a React element.
 * This is used to safely render HTML content in chat messages.
 * 
 * @param html - HTML string to parse
 * @param settings - Bot settings
 * @param styles - Bot styles
 * @returns Single JSX element (wrapped in Fragment if multiple nodes)
 */
export const parseHTMLToReact = (html: string, settings?: Settings, styles?: Styles): JSX.Element => {
	const nodes = parseHTMLNodes(html, settings, styles);
	// Wrap in Fragment to return a single element
	return createElement(Fragment, {}, ...nodes);
};

/**
 * Checks if a string contains HTML tags
 * @param str - String to check
 * @returns True if string contains HTML tags
 */
export const containsHTML = (str: string): boolean => {
	const htmlRegex = /<\/?[a-z][\s\S]*>/i;
	return htmlRegex.test(str);
};
