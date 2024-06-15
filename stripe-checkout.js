import STRIPE_KEYS from "./stripe-keys.js"
console.log(STRIPE_KEYS)
const d=document,
 $productos=d.getElementById("products"),
 $template=d.getElementById("product-template").content,
 $fragment=d.createDocumentFragment();
const fetchOptions={
    headers:{
        Authorization:`Bearer ${STRIPE_KEYS.secret}`,
    },
};
let products,prices;
const moneyFormat=num=>`$${num.slice(0,-2)}.${num.slice(-2)}`
Promise.all([
    fetch("https://api.stripe.com/v1/products",fetchOptions),
    fetch("https://api.stripe.com/v1/prices", fetchOptions)
])
.then(responses=>Promise.all(responses.map(res=>res.json())))
.then(json=>{
    //console.log(json)
    products=json[0].data;
    prices=json[1].data;
    console.log(products,prices);

    prices.forEach((el)=>{
        let productData=products.filter((product)=>product.id === el.product);
        //console.log(productData)
    
        $template.querySelector(".product").setAttribute("data-price", el.id);
        $template.querySelector("img").src=productData[0].images[0];
        $template.querySelector("img").alt=productData[0].name;
        $template.querySelector("figcaption").innerHTML=`
        ${productData[0].name}
        <br>
        ${moneyFormat(el.unit_amount_decimal)}${el.currency}`

        let $clone=d.importNode($template, true);
        
        $fragment.appendChild($clone);

    });
    $productos.appendChild($fragment);


    
})
.catch((err)=>{
    console.log(err);
    let message=err.statusText || "Ocurrió un error al conectarse con stripe";
    
});
  
d.addEventListener("click",e=>{
    if(e.target.matches(".product *")){
        let price=e.target.parentElement.getAttribute("data-price");
        //console.log(price)
        Stripe(STRIPE_KEYS.public).redirectToCheckout({
            lineItems:[{price, quantity:1}],
            mode:"payment",
            successUrl:"http://127.0.0.1:5500/ajax-ejercicios/assets/stripe-succes.html",
            cancelUrl:"http://127.0.0.1:5500/ajax-ejercicios/assets/stripe-cancel.html",

        }).then(res=>{
            if(res.error){
                $productos.insertAdjacentHTML("afterend", res.error.message);
            }
        })

    }
})        
 
 
 