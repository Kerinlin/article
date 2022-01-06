## 块级格式化上下文（BFC）

**BFC(Block Formatting Context)**，**块级格式化上下文**，是块级元素布局过程中的渲染区域。类似于js作用域{}，它代表了一个作用范围，但是与js作用域不同的是，它是完全独立的作用域，在作用域内的浮动，定位等样式布局操作都不会影响外层环境。浮动定位与清除浮动只会应用于同一个BFC内的元素。

### BFC作用

1. 清除浮动
2. 解决浮动引起的元素塌陷
3. 解决margin重叠
4. 两栏布局

### 如何创建BFC

1. **使用浮动(float)**，脱离了文档流，那么脱离的部分就是一个单独的BFC
2. **使用定位(position:absolate,fixed)**，定位是需要有参照的，建立BFC是让元素知道自己应该待在哪
3. **布局(display: inline-block,grid,flex,table....)**,通过BFC确定子元素布局的作用域
4. **overflow不为visible的元素**，visible会实际上创建元素，会占用空间，只是不显示
5. **display: flow-root**

#### flow-root

元素在通过display: flow-root后都会变成块级元素，同时会创建一个无副作用的BFC.只需要给父级元素设立flow-root,那么它的子元素都会作用在同一个BFC之中。来看下使用案例

**使用flow-root解决margin重叠问题**

```html
    <div class="content-box">
      <div class="box">
        <p>first</p>
      </div>
    </div>

    <div class="content-box flow-root">
      <div class="box ">
        <p>second</p>
      </div>
    </div>
		
    .flow-root {
      display: flow-root;
    }

    .box {
      margin: 20px;
      background-color: rgb(229, 226, 226);
      border: 10px solid rgb(37, 179, 32);
    }

    .box p {
      margin: 10px;
    }
```

效果

![image-20220106211910858](https://s2.loli.net/2022/01/06/yfgFkUE3hcHN6WT.png)

**使用flow-root清除浮动**

```html
    <!-- 使用flow-root清除浮动，解决塌陷问题 -->
    <div class="img-wrapper flow-root">
      <img src="./Siren.png" alt="">
      <p>this is a text</p>
    </div>

    .flow-root {
      display: flow-root;
    }

    .img-wrapper img {
      width: 100px;
      float: left;
    }
```

效果

![image-20220106212516697](https://s2.loli.net/2022/01/06/dBA15vCLF4k8nKH.png)

#### flow-root兼容性

![image-20220106212727410](https://s2.loli.net/2022/01/06/ALGQt7iCnUaTSWw.png)

主流大部分浏览器都已经支持了，不支持IE这个老古董，这个是个比较实用的属性，后续项目可以考虑

#### 清除浮动与消除重叠边距原理

清除浮动实际上是通过设置一个BFC隔绝浮动的作用范围，使其不会影响外部BFC，达到消除浮动的目的。消除边距类似也是将两个本来在同一个BFC中的两个块级元素隔绝，为其中一个块级元素创建新的BFC,使它们处于不同的作用域，达到消除重叠边距的目的。类似的，还有两个同时设为float:left的元素是不会重叠，原因也是BFC,它们都创建了独立的BFC,不会互相影响。