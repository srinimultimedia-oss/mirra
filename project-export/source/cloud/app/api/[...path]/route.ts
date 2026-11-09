import {env} from 'cloudflare:workers';
import {boardAPI} from '../../../lib/board-service';
export const dynamic='force-dynamic';
function handle(request:Request){if(!env.DB)return Response.json({error:'Cloud database is unavailable'},{status:503});return boardAPI(request,env.DB);}
export const GET=handle;
export const POST=handle;
export const DELETE=handle;
export const PATCH=handle;
