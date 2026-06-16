const CELL_SIZE = 64;

const inventory =
    document.getElementById("inventory");

const shop =
    document.getElementById("shop");

let currentTab =
    "wizard";

let dragItem =
    null;

let offsetX =
    0;

let offsetY =
    0;

class Item
{
    constructor(id,data)
    {
        this.id = id;

        this.image =
            data.image;

        this.width =
            data.width;

        this.height =
            data.height;

        this.pivotX =
            data.pivotX ?? 0;

        this.pivotY =
            data.pivotY ?? 0;

        this.rotation =
            0;

        this.element =
            this.createElement();
    }

    createElement()
    {
        const item =
            document.createElement("div");

        item.className =
            "item";

        item.style.left =
            "0px";

        item.style.top =
            "0px";

        item.owner =
            this;

        const sprite =
            document.createElement("div");

        sprite.className =
            "sprite";

        const img =
            document.createElement("img");

        img.src =
            this.image;

        sprite.appendChild(img);

        item.appendChild(sprite);

        this.updateSize(item);

        this.updateSprite(item);

        item.addEventListener(
            "mousedown",
            startDrag
        );

        item.addEventListener(
            "dblclick",
            ()=>this.rotate()
        );

        item.addEventListener(
            "contextmenu",
            (e)=>
            {
                e.preventDefault();
                item.remove();
            }
        );

        return item;
    }

    updateSize(item)
    {
        item.style.width =
            this.width * CELL_SIZE + "px";

        item.style.height =
            this.height * CELL_SIZE + "px";
    }

    updateSprite(item)
    {
        const sprite =
            item.querySelector(".sprite");

        const img =
            sprite.querySelector("img");

        const pixelWidth =
            this.width * CELL_SIZE;

        const pixelHeight =
            this.height * CELL_SIZE;

        img.style.width =
            pixelWidth + "px";

        img.style.height =
            pixelHeight + "px";

        sprite.style.left = "0px";
        sprite.style.top = "0px";

        sprite.style.transformOrigin =
            `${this.pivotX * CELL_SIZE + CELL_SIZE/2}px ${
                this.pivotY * CELL_SIZE + CELL_SIZE/2
            }px`;

        sprite.style.transform =
            `rotate(${this.rotation}deg)`;
    }

    rotate()
    {
        this.rotation =
            (this.rotation + 90);

        this.updateSprite(this.element);
    }
}

const ITEMS = {

    Energybolt:{
        class:"wizard",
        image:"Energybolt.png",
        width:2,
        height:1,
        pivotX:0,
        pivotY:0
    },

    OldBranch:{
        class:"wizard",
        image:"OldBranch.png",
        width:1,
        height:2,
        pivotX:0,
        pivotY:0
    },

    MagicStaff:{
        class:"wizard",
        image:"MagicStaff.png",
        width:1,
        height:3,
        pivotX:0,
        pivotY:1
    }
};

function loadShop(tab)
{
    shop.innerHTML = "";

    for(const id in ITEMS)
    {
        const data =
            ITEMS[id];

        if(data.class !== tab)
            continue;

        const div =
            document.createElement("div");

        div.className =
            "shop-item";

        const img =
            document.createElement("img");

        img.src =
            data.image;

        div.appendChild(img);

        div.onclick =
            ()=>{
                const item =
                    new Item(id,data);

                inventory.appendChild(
                    item.element
                );
            };

        shop.appendChild(div);
    }
}

function startDrag(e)
{
    dragItem =
        e.currentTarget;

    offsetX =
        e.offsetX;

    offsetY =
        e.offsetY;
}

document.addEventListener(
    "mousemove",
    (e)=>
    {
        if(!dragItem)
            return;

        const rect =
            inventory.getBoundingClientRect();

        dragItem.style.left =
            (e.clientX - rect.left - offsetX)
            + "px";

        dragItem.style.top =
            (e.clientY - rect.top - offsetY)
            + "px";
    }
);

document.addEventListener(
    "mouseup",
    ()=>{
        if(!dragItem)
            return;

        let x =
            parseFloat(dragItem.style.left);

        let y =
            parseFloat(dragItem.style.top);

        x =
            Math.round(x / CELL_SIZE)
            * CELL_SIZE;

        y =
            Math.round(y / CELL_SIZE)
            * CELL_SIZE;

        dragItem.style.left =
            x + "px";

        dragItem.style.top =
            y + "px";

        dragItem = null;
    }
);

document
.querySelectorAll(".tabs button")
.forEach(btn=>
{
    btn.addEventListener(
        "click",
        ()=>{
            currentTab =
                btn.dataset.tab;

            loadShop(currentTab);
        }
    );
});

document
.getElementById("searchBox")
.addEventListener(
    "input",
    (e)=>
    {
        const keyword =
            e.target.value
            .toLowerCase();

        document
        .querySelectorAll(".shop-item")
        .forEach(div=>
        {
            const name =
                div.dataset.name ?? "";

            div.style.display =
                name.includes(keyword)
                ? "flex"
                : "none";
        });
    }
);

loadShop("wizard");     });
    }
);

loadShop("wizard");