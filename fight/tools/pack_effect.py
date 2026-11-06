"""Pack an AI-generated 8-frame energy-attack strip into the Roman Arena effect format.
Usage: python fight/tools/pack_effect.py input.png fight/specials/painted/<id>_effect.png
Output: 1280x160 RGBA, 8 frames of 160x160, one shared scale so the grow/shrink animation is preserved.
Loose sparks/embers are assigned to the nearest frame, so tails that overlap slice lines are kept whole."""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src,out=sys.argv[1],sys.argv[2]
im=Image.open(src).convert('RGBA'); a=np.array(im); a[...,3][a[...,3]<40]=0
W=a.shape[1]; mask=a[...,3]>0
lab,n=ndimage.label(mask, structure=np.ones((3,3)))
cents=ndimage.center_of_mass(mask,lab,range(1,n+1)); sizes=ndimage.sum(mask,lab,range(1,n+1))
# frame centers from big components' column mass
big=[(c[1],s) for c,s in zip(cents,sizes) if s>2000]
centers=[(i+0.5)*W/8 for i in range(8)]
owner=np.zeros(n+1,int)
for k,(c,s) in enumerate(zip(cents,sizes),1):
    # embers sit to the LEFT of their arc (trailing), so bias a little rightward
    owner[k]=int(np.argmin([abs(c[1]+(25 if s<2000 else 0)-x) for x in centers]))
crops=[]
for i in range(8):
    f=a.copy(); keep=np.isin(lab,np.where(owner==i)[0]); f[...,3]=np.where(keep,f[...,3],0)
    fi=Image.fromarray(f); crops.append(fi.crop(fi.getbbox()))
print('components',n,'widths',[c.width for c in crops])
scale=144/max(max(c.size) for c in crops)
sheet=Image.new('RGBA',(1280,160),(0,0,0,0))
for i,c in enumerate(crops):
    c=c.resize((max(1,round(c.width*scale)),max(1,round(c.height*scale))),Image.LANCZOS)
    sheet.alpha_composite(c,(i*160+(160-c.width)//2,(160-c.height)//2))
sheet.save(out); print(out,sheet.size,'scale %.3f'%scale)
