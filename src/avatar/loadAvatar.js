// Docs: github.com/pixiv/three-vrm (README) e pixiv.github.io/three-vrm/docs
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { VrmAdapter } from './vrmAdapter.js';
import { GlbAdapter } from './glbAdapter.js';

const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

export async function loadAvatar(url, cfg) {
  const gltf = await loader.loadAsync(url);
  const vrm = gltf.userData.vrm;
  if (vrm) {
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.combineSkeletons(gltf.scene);
    VRMUtils.rotateVRM0(vrm); // VRM 0.x vira 180° para olhar igual ao 1.0
    return new VrmAdapter(vrm, cfg);
  }
  return new GlbAdapter(gltf, cfg);
}
