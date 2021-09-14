"use strict";

browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId != "copy-gitlab-todo") {
    return;
  }

  let linkText = info.linkText;
  let link = info.linkUrl;
  if (info.modifiers && info.modifiers.length == 1 && info.modifiers[0] == "Shift") {
    let resultText;
    let resultLink;
    try {
      resultText = await browser.tabs.executeScript(tab.id, {
        frameId: info.frameId,
        code: `
          var title = "";
          var elem = browser.menus.getTargetElement(${info.targetElementId});
          while (elem) {
            if (elem.href ||
                elem.hasAttribute("href") ||
                elem.hasAttributeNS("http://www.w3.org/1999/xlink", "href")) {
              if (elem.hasAttribute("title")) {
                title = elem.getAttribute("title");
              }
              break;
            }
            elem = elem.parentElement;
          }
          title;
        `,
      });
    }
    catch(ex) {
      console.error(ex);
    }
    try {
      resultLink = await browser.tabs.executeScript(tab.id, {
        frameId: info.frameId,
        code: `
          var link = "";
          var elem = browser.menus.getTargetElement(${info.targetElementId});
          while (elem) {
            const elemLink = elem.href || elem.hasAttribute("href") || elem.hasAttributeNS("http://www.w3.org/1999/xlink", "href");
            if (elemLink) {
              link = elemLink;
              break;
            }
            elem = elem.parentElement;
          }
          link;
        `,
      });
    }
    catch(ex) {
      console.error(ex);
    }
    if (resultText && resultText[0] != "" && resultText[0] != linkText) { 
      linkText = resultText[0]; 
    }
    if (resultLink && resultLink[0] != "" && resultLink[0] != link) { 
      link = resultLink[0]; 
    }
  }

  linkText = JSON.stringify(linkText)
                 .replace(/^"|"$/g, "")
                 .replace(/\\(?=")/g, "");
  link = JSON.stringify(link)
  .replace(/^"|"$/g, "")
  .replace(/\\(?=")/g, "");

  const textToCopy = `- [${linkText}](${link})`;
  
  navigator.clipboard.writeText(textToCopy).catch(() => {
    console.error("Failed to copy the link text.");
  });
});

browser.menus.create({
  id: "copy-gitlab-todo",
  title: browser.i18n.getMessage("contextMenuItemLink"),
  contexts: ["link"],
});
