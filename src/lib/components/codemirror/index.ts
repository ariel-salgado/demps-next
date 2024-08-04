import type { EditorContext } from './editor';

import { SaveData } from './save-data';
import { LoadData } from './load-data';
import { ClearData } from './clear-data';
import { UploadFile } from './upload-file';
import { Editor, contextKey } from './editor';
import { DownloadFile } from './download-file';
import { CopyToClipboard } from './copy-to-clipboard';

export type { EditorContext };

export {
	Editor,
	SaveData,
	LoadData,
	ClearData,
	UploadFile,
	DownloadFile,
	CopyToClipboard,
	contextKey,
	//
	contextKey as editorContextKey
};
