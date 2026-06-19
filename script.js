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

let isDragging =
    false;

let dragStartX =
    0;

let dragStartY =
    0;

let longPressTimer =
    null;

let longPressTriggered =
    false;

let lastTappedItem =
    null;

let lastTapTime =
    0;

const DRAG_THRESHOLD = 6;
const DOUBLE_TAP_DELAY = 320;
const LONG_PRESS_DELAY = 650;

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

        img.draggable =
            false;

        sprite.appendChild(img);

        item.appendChild(sprite);

        this.updateSize(item);

        this.updateSprite(item);

        item.addEventListener(
            "pointerdown",
            startPointer
        );

        item.addEventListener(
            "pointermove",
            movePointer
        );

        item.addEventListener(
            "pointerup",
            endPointer
        );

        item.addEventListener(
            "pointercancel",
            cancelPointer
        );

        item.addEventListener(
            "contextmenu",
            (e)=>
            {
                e.preventDefault();

                if(e.pointerType === "touch")
                    return;

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
            (this.rotation + 90) % 360;

        this.updateSprite(this.element);
    }
}

const ITEMS = {

    Energybolt:{
        class:"wizard",
        name:"Energy Bolt",
        image:"assets/wizard/Energybolt.png",
        width:2,
        height:1,
        pivotX:0,
        pivotY:0
    },

    OldBranch:{
        class:"wizard",
        name:"Old Branch",
        image:"assets/wizard/OldBranch.png",
        width:1,
        height:2,
        pivotX:0,
        pivotY:0
    },

    MagicStaff:{
        class:"wizard",
        name:"Magic Staff",
        image:"assets/wizard/MagicStaff.png",
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

        div.dataset.name =
            (data.name ?? id).toLowerCase();

        const img =
            document.createElement("img");

        img.src =
            data.image;

        img.alt =
            data.name ?? id;

        img.draggable =
            false;

        div.appendChild(img);

        div.addEventListener(
            "click",
            ()=>
            {
                const item =
                    new Item(id,data);

                inventory.appendChild(
                    item.element
                );
            }
        );

        shop.appendChild(div);
    }
}

function startPointer(e)
{
    if(e.button !== undefined && e.button !== 0)
        return;

    e.preventDefault();

    dragItem =
        e.currentTarget;

    dragItem.setPointerCapture(e.pointerId);

    isDragging =
        false;

    longPressTriggered =
        false;

    dragStartX =
        e.clientX;

    dragStartY =
        e.clientY;

    const rect =
        inventory.getBoundingClientRect();

    offsetX =
        e.clientX
        - rect.left
        - parseFloat(dragItem.style.left);

    offsetY =
        e.clientY
        - rect.top
        - parseFloat(dragItem.style.top);

    clearTimeout(longPressTimer);

    longPressTimer =
        setTimeout(
            ()=>
            {
                if(!dragItem || isDragging)
                    return;

                longPressTriggered =
                    true;

                dragItem.remove();
                dragItem = null;
            },
            LONG_PRESS_DELAY
        );
}

function movePointer(e)
{
    if(!dragItem)
        return;

    e.preventDefault();

    const movedX =
        Math.abs(e.clientX - dragStartX);

    const movedY =
        Math.abs(e.clientY - dragStartY);

    if(movedX > DRAG_THRESHOLD || movedY > DRAG_THRESHOLD)
    {
        isDragging =
            true;

        clearTimeout(longPressTimer);
    }

    const rect =
        inventory.getBoundingClientRect();

    dragItem.style.left =
        (e.clientX - rect.left - offsetX)
        + "px";

    dragItem.style.top =
        (e.clientY - rect.top - offsetY)
        + "px";
}

function endPointer(e)
{
    clearTimeout(longPressTimer);

    if(!dragItem)
        return;

    e.preventDefault();

    snapToGrid(dragItem);

    if(!isDragging && !longPressTriggered)
    {
        const now =
            Date.now();

        if(lastTappedItem === dragItem && now - lastTapTime <= DOUBLE_TAP_DELAY)
        {
            dragItem.owner.rotate();

            lastTappedItem =
                null;

            lastTapTime =
                0;
        }
        else
        {
            lastTappedItem =
                dragItem;

            lastTapTime =
                now;
        }
    }

    dragItem =
        null;
}

function cancelPointer()
{
    clearTimeout(longPressTimer);

    if(dragItem)
        snapToGrid(dragItem);

    dragItem =
        null;
}

function snapToGrid(item)
{
    let x =
        parseFloat(item.style.left);

    let y =
        parseFloat(item.style.top);

    x =
        Math.round(x / CELL_SIZE)
        * CELL_SIZE;

    y =
        Math.round(y / CELL_SIZE)
        * CELL_SIZE;

    item.style.left =
        x + "px";

    item.style.top =
        y + "px";
}

document
.querySelectorAll(".tabs button")
.forEach(btn=>
{
    btn.addEventListener(
        "click",
        ()=>
        {
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

document.addEventListener(
    "selectstart",
    (e)=>e.preventDefault()
);

loadShop("wizard");
