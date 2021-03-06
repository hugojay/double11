const getToken = () =>
  fetch('https://www.rakuten.com.tw/api/csrf_tokens.json')
    .then(res => res.json())
    .then(({ token }) => token)

const addToCart = token =>
  fetch('https://www.rakuten.com.tw/api/carts/add.json', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'x-csrf-token': token,
      'x-requested-with': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // shop_id: 'd2e138b0-7ed8-11e6-b97d-2c600c73734f',
      // merchant_id: 'd2daa900-7ed8-11e6-be17-54ab3a295b79',
      // item_id: '9b061c90-0f2f-11ea-948e-0242ac110003',
      // variant_id: '9b061c91-0f2f-11ea-948e-0242ac110003',
      // price: '290',
      // iphone
      shop_id: '317dfcd0-dc55-11e6-9d99-2c600c429076',
      merchant_id: '31745fe0-dc55-11e6-9d99-2c600c429076',
      item_id: '189356f0-1a70-11ea-870b-0242ac110003',
      variant_id: '189356f1-1a70-11ea-870b-0242ac110003',
      price: '17430',
      currency: '元',
      quantity: '1'
    })
  }).then(res => res.json())

const step1 = body =>
  fetch('https://www.rakuten.com.tw/buy/login?l-id=tw_cart_checkout_1', {
    method: 'POST',
    credentials: 'same-origin',
    body
  })

// const answer = {
//   shop_cart: {
//     shopId: 'd2e138b0-7ed8-11e6-b97d-2c600c73734f',
//     shopperId: 'member-8k58223mvz5dvn4685yw6d5slzca',
//     items: [
//       {
//         currency: 'TWD',
//         deliverable: true,
//         in_stock: true,
//         itemId: '9b061c90-0f2f-11ea-948e-0242ac110003',
//         itemVariantId: '9b061c91-0f2f-11ea-948e-0242ac110003',
//         merchantId: 'd2daa900-7ed8-11e6-be17-54ab3a295b79',
//         price: '290',
//         is_bogo_item: false,
//         quantities: 2,
//         rakuten_category: { rakutenCategoryId: 9005 }
//       }
//     ],
//     bundleInfo: { bundleDiscount: 0, subtotal: 580 },
//     orderCampaignInfo: { orderCampaignDiscount: 0 }
//   }
// }

const step2 = body =>
  fetch('https://www.rakuten.com.tw/buy/shipping_update', {
    method: 'POST',
    credentials: 'include',
    mode: 'same-origin',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'referer': 'https://www.rakuten.com.tw/buy/shipping?l-id=tw_checksignin_member',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

const getPmps = () =>
  fetch('https://www.rakuten.com.tw/buy/shipping?l-id=tw_checksignin_member')


function urlencodeFormData(fd){
  var s = '';
  function encode(s){ return encodeURIComponent(s).replace(/%20/g,'+'); }
  for(var pair of fd.entries()){
    if(typeof pair[1]=='string'){
      s += (s?'&':'') + encode(pair[0])+'='+encode(pair[1]);
    }
  }
  return s;
}

const execute = async () => {
  const token = await getToken()
  console.log(token)

  let addToCartRes = await addToCart(token)
  while (!addToCartRes || addToCartRes.status !== 200) {
    console.log(addToCartRes)
    addToCartRes = await addToCart(token)
  }
  const { status, shopperId, shopCarts } = addToCartRes
  const { shopId, items } = shopCarts[0]
  const { quantities, price } = items[0]

  console.log(addToCartRes)

  // step1
  const formData = new FormData()
  formData.append('authenticity_token', token)
  // formData.append('cart', JSON.stringify(answer))
  formData.append(
    'cart',
    JSON.stringify({
      shop_cart: {
        shopId,
        shopperId,
        items: [
          {
            ...items[0],
            currency: 'TWD',
            deliverable: true,
            in_stock: true,
            is_bogo_item: false,
            // rakuten_category: { rakutenCategoryId: 5174 }
            rakuten_category: { rakutenCategoryId: 9005 }
          }
        ],
        bundleInfo: { bundleDiscount: 0, subtotal: quantities * Number(price) },
        orderCampaignInfo: { orderCampaignDiscount: 0 }
      }
    })
  )

  const step1Res = await step1(formData).then(res => res.text())
  // console.log(step1Res)
  // console.log(step1Res.status)

  //step2
  // const pmpsPage = await getPmps().then(res => res.text())

  // let pmpsK, pmpsFlag
  // let found = step1Res.match(/\"pmps_key\":\"(.*)\",\"p/)
  // if (found) {
  //   pmpsK = found[1]
  // }
  // found = step1Res.match(/\"pmps_flag\":\"(.*)\"}},\"u/)
  // if (found) {
  //   pmpsFlag = found[1]
  // }

  // console.log(pmpsK)
  // console.log(pmpsFlag)

  // const formData2 = new FormData()
  // formData2.append('authenticity_token', token)
  // formData2.append('pmps-k', pmpsK)
  // formData2.append('pmps-flag', pmpsFlag)
  // formData2.append('recipient[firstName1]', 'Damon')
  // formData2.append('recipient[lastName1]', 'Shen')
  // formData2.append('recipient[countryCode]', 'TW')
  // formData2.append('recipient[address1]', '三重路66號14F')
  // formData2.append('recipient[phoneNumber]', '0979102078')
  // formData2.append('recipient[postalCode]', '115')
  // formData2.append('recipient[province]', 'TW-TPE')
  // formData2.append('recipient[city]', 'TW-TPE-11')
  // formData2.append('recipient[shipping_type]', 'existing_addresses')
  // formData2.append('shipping_method', 'c63b9dc0-8163-11e6-be17-54ab3a295b79')

  // console.log(urlencodeFormData(formData2));
  // const step2Res = await step2(urlencodeFormData(formData2))
  // console.log(step2Res)
}

execute()
