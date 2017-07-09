import * as core from 'express-serve-static-core';
import * as tr from 'rcf-message-router';
declare let router: core.Router;
declare let connectionsManager: tr.IConnectionsManager;
export { router as Router, connectionsManager as ConnectionsManager };
