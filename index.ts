import { copyFile } from 'fs-extra';
import { EmbedVideo, EmbedVideoOptions, getKnownPlatforms } from './EmbedVideo';

import visit from 'unist-util-visit';

// Copy custom element files to static folder
const copyStaticFiles = () => {
  const ly = require.resolve('@justinribeiro/lite-youtube/lite-youtube.js');
  const lv = require.resolve('@slightlyoff/lite-vimeo/lite-vimeo.js');
  const DEPLOY_DIR = 'public/static';
  return Promise.all([
    copyFile(ly, `${DEPLOY_DIR}/lite-youtube.js`),
    copyFile(lv, `${DEPLOY_DIR}/lite-vimeo.js`),
  ]);
};

const addLiteElements = ({ markdownAST }: any, options: EmbedVideoOptions) => {
  visit(markdownAST, `inlineCode`, (node: { type: string; value: string }) => {
    const { value } = node;
    let knownPlatforms = getKnownPlatforms();
    let keywords = [...knownPlatforms, 'video'].join('|');
    let re = new RegExp(`\(${keywords}\):\(\.\*\)`, 'i');

    const processValue = value.match(re);
    if (processValue) {
      let type = processValue[1];
      let id = processValue[2];
      id = id.trim();

      let embedVideo = new EmbedVideo(type, id, options);

      node.type = `html`;
      node.value = embedVideo.getHTML();
    }
  });

  return copyStaticFiles();
};

export = addLiteElements;
