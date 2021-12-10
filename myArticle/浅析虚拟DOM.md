## 浅析虚拟DOM

谈虚拟DOM之前，先谈谈真实的DOM渲染，由此分析真实DOM渲染过程中可能存在啥问题，以及为啥需要虚拟DOM,虚拟DOM能做啥，虚拟DOM存在什么问题。

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

那么需要真实的操作DOM100w次,触发了回流100w次。每次DOM的更新都会按照流程进行无差别的真实dom的更新。所以造成了很大的性能浪费。如果循环里面是复杂的操作，频繁触发回流与重绘，那么就很容易就影响性能，造成卡顿。虚拟dom的出现解决了这些问题。



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
            text: 'This is a container'
        },
    }]
}

//对应的真实DOM结构
<div id="container">
  <div class="content">
    This is a container
  </div>
</div>
```

虚拟DOM的更新不会立即操作DOM，而是会通过diff算法，找出需要更新的节点，按需更新，并将更新的内容保存为一个js对象，更新完成后再挂载到真实dom上，实现真实的dom更新。通过虚拟DOM，解决了操作真实DOM的两个问题。

1. 无差别频繁更新导致DOM频繁更新，造成性能问题
2. 频繁回流与重绘

另外由于虚拟DOM保存的是js对象，天然的具有**跨平台**的能力,而不仅仅局限于浏览器。

#### 优点

总结起来，虚拟DOM的优势有以下几点

1. 小修改无需频繁更新DOM，框架的diff算法会自动比较，分析出需要更新的节点，按需更新
2. 更新数据不会造成频繁的回流与重绘
3. 保存的是对象，具备跨平台能力

#### 缺点

虚拟DOM同样也有缺点，首次渲染大量DOM时，由于多了一层虚拟DOM的计算，会比innerHTML插入慢。