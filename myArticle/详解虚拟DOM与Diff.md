## 详解虚拟DOM与Diff算法

最近复习到虚拟DOM，翻阅了众多资料，特此总结了这篇长文，加深自己对vue的理解。

### 真实DOM的渲染

![](https://upload-images.jianshu.io/upload_images/15050783-c14e5c2c54996b48.png?imageMogr2/auto-orient/strip|imageView2/2/w/646/format/webp)



浏览器真实DOM渲染的过程大概分为以下几个部分

1. **构建DOM树**。通过HTML parser解析处理HTML标记，将它们构建为DOM树(DOM tree)，当解析器遇到非阻塞资源(图片，css),会继续解析，但是如果遇到script标签(特别是没有async 和 defer属性)，会阻塞渲染并停止html的解析，这就是为啥最好把script标签放在body下面的原因。
2. **构建CSSOM树**。与构建DOM类似,浏览器也会将样式规则，构建成CSSOM。浏览器会遍历CSS中的规则集，根据css选择器创建具有父子，兄弟等关系的节点树。
3. **构建Render树**。这一步将DOM和CSSOM关联，确定每个 DOM 元素应该应用什么 CSS 规则。将所有相关样式匹配到DOM树中的每个可见节点，并根据CSS级联确定每个节点的计算样式，不可见节点(head,属性包括 display:none的节点)不会生成到Render树中。
4. **布局/回流(Layout/Reflow)**。浏览器第一次确定节点的位置以及大小叫布局，如果后续**节点位置以及大小发生变化**，这一步触发布局调整，也就是 **回流**。
5. **绘制/重绘(Paint/Repaint)**。将元素的每个可视部分绘制到屏幕上，包括文本、颜色、边框、阴影和替换的元素（如按钮和图像）。如果**文本、颜色、边框、阴影**等这些元素发生变化时，会触发**重绘(Repaint)**。为了确保重绘的速度比初始绘制的速度更快，屏幕上的绘图通常被分解成数层。将内容提升到GPU层(可以通过tranform,filter,will-change,opacity触发)可以提高绘制以及重绘的性能。
6. **合成(Compositing)**。这一步将绘制过程中的分层合并，确保它们以正确的顺序绘制到屏幕上显示正确的内容。



### 为啥需要虚拟DOM

上面这是一次DOM渲染的过程，如果dom更新，那么dom需要重新渲染一次，如果存在下面这种情况

```javascript
<body>
    <div id="container">
        <div class="content" style="color: red;font-size:16px;">
            This is a container
        </div>
				....
        <div class="content" style="color: red;font-size:16px;">
            This is a container
        </div>
    </div>
</body>
<script>
    let content = document.getElementsByClassName('content');
    for (let i = 0; i < 1000000; i++) {
        content[i].innerHTML = `This is a content${i}`;
        // 触发回流
        content[i].style.fontSize = `20px`;
    }
</script>
```

那么需要真实的操作DOM100w次,触发了回流100w次。每次DOM的更新都会按照流程进行无差别的真实dom的更新。所以造成了很大的性能浪费。如果循环里面是复杂的操作，频繁触发回流与重绘，那么就很容易就影响性能，造成卡顿。另外这里要说明一下的是，虚拟DOM并不是意味着比DOM就更快，性能需要分场景，虚拟DOM的性能跟模板大小是正相关。虚拟DOM的比较过程是不会区分数据量大小的，在组件内部只有少量动态节点时，虚拟DOM依然是会对整个vdom进行遍历，相比直接渲染而言是多了一层操作的。

```javascript
	<div class="list">
    <p class="item">item</p>
    <p class="item">item</p>
    <p class="item">item</p>
    <p class="item">{{ item }}</p>
    <p class="item">item</p>
    <p class="item">item</p>
  </div>
```

比如上面这个例子，虚拟DOM。虽然只有一个动态节点，但是虚拟DOM依然需要遍历diff整个list的class，文本，标签等信息，最后依然需要进行DOM渲染。如果只是dom操作，就只要操作一个具体的DOM然后进行渲染。虚拟DOM最核心的价值在于，它能通过js描述真实DOM，表达力更强，通过声明式的语言操作，为开发者提供了更加方便快捷开发体验，而且在没有手动优化，大部分情景下，保证了性能下限，性价比更高。

### 虚拟DOM

虚拟DOM本质上是一个js对象，通过对象来表示真实的DOM结构。tag用来描述标签，props用来描述属性，children用来表示嵌套的层级关系。

```javascript
const vnode = {
    tag: 'div',
    props: {
        id: 'container',
    },
    children: [{
        tag: 'div',
        props: {
            class: 'content',
        },
      	text: 'This is a container'
    }]
}

//对应的真实DOM结构
<div id="container">
  <div class="content">
    This is a container
  </div>
</div>
```

虚拟DOM的更新不会立即操作DOM，而是会通过diff算法，找出需要更新的节点，按需更新，并将更新的内容保存为一个js对象，更新完成后再挂载到真实dom上，实现真实的dom更新。通过虚拟DOM，解决了操作真实DOM的三个问题。

1. 无差别频繁更新导致DOM频繁更新，造成性能问题
2. 频繁回流与重绘
2. 开发体验

另外由于虚拟DOM保存的是js对象，天然的具有**跨平台**的能力,而不仅仅局限于浏览器。

#### 优点

总结起来，虚拟DOM的优势有以下几点

1. 小修改无需频繁更新DOM，框架的diff算法会自动比较，分析出需要更新的节点，按需更新
2. 更新数据不会造成频繁的回流与重绘
2. 表达力更强，数据更新更加方便
3. 保存的是js对象，具备跨平台能力

#### 不足

虚拟DOM同样也有缺点，首次渲染大量DOM时，由于多了一层虚拟DOM的计算，会比innerHTML插入慢。

### 虚拟DOM实现原理

主要分三部分

1. 通过js建立节点描述对象
2. diff算法比较分析新旧两个虚拟DOM差异
3. 将差异patch到真实dom上实现更新

第一部分上面已经讲了，接下来讲第二部分diff

#### Diff算法

为了避免不必要的渲染，按需更新，虚拟DOM会采用Diff算法进行虚拟DOM节点比较,比较节点差异，从而确定需要更新的节点，再进行渲染。vue采用的是**深度优先，同层比较**的策略。

![](https://img2018.cnblogs.com/blog/1015847/201901/1015847-20190102105213116-466136499.png)

新节点与旧节点的比较主要是围绕三件事来达到渲染目的

1. **创建新节点**
2. **删除废节点**
3. **更新已有节点**

**如何比较新旧节点是否一致呢？**

```javascript
function sameVnode(a, b) {
    return (
        a.key === b.key &&
        a.asyncFactory === b.asyncFactory && (
            (
                a.tag === b.tag &&
                a.isComment === b.isComment &&
                isDef(a.data) === isDef(b.data) &&
                sameInputType(a, b) //对input节点的处理
            ) || (
                isTrue(a.isAsyncPlaceholder) &&
                isUndef(b.asyncFactory.error)
            )
        )
    )
}

//判断两个节点是否是同一种 input 输入类型
function sameInputType(a, b) {
    if (a.tag !== 'input') return true
    let i
    const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type
    const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type
    //input type 相同或者两个type都是text
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}
```

可以看到，两个节点是否相同是需要比较**标签(tag)**，**属性(在vue中是用data表示vnode中的属性props)**,**注释节点(isComment)**的,另外碰到input的话，是会做特殊处理的。

#### 创建新节点

当新节点有的，旧节点没有，这就意味着这是全新的内容节点。只有元素节点，文本节点，注释节点才能被创建插入到DOM中。

```javascript
const oldVnode = {
    tag: 'div',
    props: {
        class: 'list'
    },
  	text: 'list'
    children: [{
        tag: 'p',
        props: {
            class: 'item'
        },
    }]
}

const newVnode = {
    tag: 'div',
    props: {
        class: 'list'
    },
  	text: 'list'
    children: [{
            tag: 'p',
            props: {
                class: 'item'
            },
        },
        //新增内容，直接在节点后新增
        {
            tag: 'h1',
            props: {
                class: 'item'
            },
        },
    ]
}
```

#### 删除旧节点

当旧节点有，而新节点没有，那就意味着，新节点放弃了旧节点的一部分。删除节点会连带的删除旧节点的子节点。

```javascript
const oldVnode = {
    tag: 'div',
    props: {
        class: 'list'
    },
  	text: 'list'
    children: [
      //新节点没有这个标签，所以会执行清除操作，连带子节点一块删除
      {
        tag: 'div',
        props: {
            class: 'item'
        },
      children: [
        {
         	tag: 'p',
        	props: {
            class: 'item-p'
        	},
        }
      ]
    }]
}

const newVnode = {
    tag: 'div',
    props: {
        class: 'list'
    },
  	text: 'list'
    children: [
        {
            tag: 'h1',
            props: {
                class: 'item'
            },
        },
    ]
}
```

上面例子中就会连带删除旧节点的item,item-p。

#### 更新节点

新的节点与旧的的节点都有，那么一切以新的为准，更新旧节点。如何判断是否需要更新节点呢?

- 判断新节点与旧节点是否完全一致,一样的话就不需要更新

```javascript
  // 判断vnode与oldVnode是否完全一样
  if (oldVnode === vnode) {
    return;
  }
```

- 判断新节点与旧节点是否是静态节点，key是否一样，是否是克隆节点(如果不是克隆节点，那么意味着渲染函数被重置了，这个时候需要重新渲染)或者是否设置了once属性,满足条件的话替换componentInstance

```javascript
  // 是否是静态节点，key是否一样，是否是克隆节点或者是否设置了once属性
  if (
    isTrue(vnode.isStatic) &&
    isTrue(oldVnode.isStatic) &&
    vnode.key === oldVnode.key &&
    (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
  ) {
    vnode.componentInstance = oldVnode.componentInstance;
    return;
  }
```

- 判断新节点是否有文本(通过text属性判断)，如果有文本那么需要比较同层级旧节点，如果旧节点文本不同于新节点文本，那么采用新的文本内容。如果新节点没有文本，那么后面需要对子节点的相关情况进行判断

```javascript
//判断新节点是否有文本
if (isUndef(vnode.text)) {
  //如果没有文本，处理子节点的相关代码
  ....
} else if (oldVnode.text !== vnode.text) {
  //新节点文本替换旧节点文本
  nodeOps.setTextContent(elm, vnode.text)
}
```

- 判断新节点与旧节点的子节点相关状况。这里又能分为4种情况
  1. 新节点与旧节点**都有子节点**
  2. **只有新节点有**子节点
  3. **只有旧节点有**子节点
  4. 新节点与旧节点**都没有子节点**

**都有子节点**

对于都有子节点的情况，需要对新旧节点做比较，如果他们不相同，那么需要进行diff操作，在vue中这里就是updateChildren方法，后面会详细再讲，子节点的比较主要是双端比较。

```javascript
//判断新节点是否有文本
if (isUndef(vnode.text)) {
    //新旧节点都有子节点情况下，如果新旧子节点不相同，那么进行子节点的比较，就是updateChildren方法
    if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    }
} else if (oldVnode.text !== vnode.text) {
    //新节点文本替换旧节点文本
    nodeOps.setTextContent(elm, vnode.text)
}
```

**只有新节点有子节点**

只有新节点有子节点，那么就代表着这是新增的内容，那么就是新增一个子节点到DOM，新增之前还会做一个重复key的检测，并做出提醒，同时还要考虑，旧节点如果只是一个文本节点，没有子节点的情况，这种情况下就需要清空旧节点的文本内容。

```javascript
//只有新节点有子节点
if (isDef(ch)) {
  //检查重复key
  if (process.env.NODE_ENV !== 'production') {
    checkDuplicateKeys(ch)
  }
  //清除旧节点文本
  if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
  //添加新节点
  addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
}

//检查重复key
function checkDuplicateKeys(children) {
  const seenKeys = {}
  for (let i = 0; i < children.length; i++) {
      const vnode = children[i]
      //子节点每一个Key
      const key = vnode.key
      if (isDef(key)) {
          if (seenKeys[key]) {
              warn(
                  `Duplicate keys detected: '${key}'. This may cause an update error.`,
                  vnode.context
              )
          } else {
              seenKeys[key] = true
          }
      }
  }
}
```

**只有旧节点有子节点**

只有旧节点有，那就说明，新节点抛弃了旧节点的子节点，所以需要删除旧节点的子节点

```javascript
if (isDef(oldCh)) {
  //删除旧节点
  removeVnodes(oldCh, 0, oldCh.length - 1)
}
```

**都没有子节点**

这个时候需要对旧节点文本进行判断，看旧节点是否有文本，如果有就清空

```javascript
if (isDef(oldVnode.text)) {
  //清空
  nodeOps.setTextContent(elm, '')
}
```

配上流程图会更清晰点

![](https://vue-js.com/learn-vue/assets/img/3.7b0442aa.png)

整体的逻辑代码如下

```javascript
function patchVnode(
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
) {
    // 判断vnode与oldVnode是否完全一样
    if (oldVnode === vnode) {
        return
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
        // 克隆重用节点
        vnode = ownerArray[index] = cloneVNode(vnode)
    }

    const elm = vnode.elm = oldVnode.elm

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
        if (isDef(vnode.asyncFactory.resolved)) {
            hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
        } else {
            vnode.isAsyncPlaceholder = true
        }
        return
    }
		// 是否是静态节点，key是否一样，是否是克隆节点或者是否设置了once属性
    if (isTrue(vnode.isStatic) &&
        isTrue(oldVnode.isStatic) &&
        vnode.key === oldVnode.key &&
        (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
        vnode.componentInstance = oldVnode.componentInstance
        return
    }

    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
        i(oldVnode, vnode)
    }

    const oldCh = oldVnode.children
    const ch = vnode.children

    if (isDef(data) && isPatchable(vnode)) {
      	//调用update回调以及update钩子
        for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
        if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }

    if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
            if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
        } else if (isDef(ch)) {
            if (process.env.NODE_ENV !== 'production') {
                checkDuplicateKeys(ch)
            }
            if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
            addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
        } else if (isDef(oldCh)) {
            removeVnodes(oldCh, 0, oldCh.length - 1)
        } else if (isDef(oldVnode.text)) {
            nodeOps.setTextContent(elm, '')
        }
    } else if (oldVnode.text !== vnode.text) {
        nodeOps.setTextContent(elm, vnode.text)
    }

    if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
}
```

