const payload = localStorage.getItem('payload')
const personObj = JSON.parse(payload)
const userId = personObj['user_id']
const article_id = localStorage.getItem('article_id')
const main_url = "http://127.0.0.1:8000"



window.onload = async function load_detail() {
    const response = await fetch(`${main_url}/article/${article_id}/detail/`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem('access'),
            "content-type": "application/json"
        },
        method: 'GET',
    })

    response_json = await response.json()
    console.log(response_json)

    const category = document.getElementById('article_category')
    category.setAttribute('value', response_json.category)
    const content = document.getElementById('article_content')
    content.setAttribute('value', response_json.content)

    //작성자 아니면 수정, 삭제 버튼 안보임
    if (response_json.user != userId){
        const article_edit = document.getElementById('article_edit_btn')
        article_edit.style.visibility = 'hidden'
        const article_del = document.getElementById('article_del_btn')
        article_del.style.visibility = 'hidden'
    }
    load_comments();

 //  if (response_json.user != userId){
        const comment_list = document.getElementById('comment_list')
        let output = ''
        response_json.comment_set.reverse().forEach(element => {
            output += `
            <input class="form-control" type="text" value="${element.content}" readonly>
            
            <button type="button" class="btn btn-outline-dark" id="edit_comment_btn" onclick=save_comment_id(${element.id}) data-bs-toggle="modal" data-bs-target="#comment_edit_modal">edit comment</button>
            <button type="button" class="btn btn-outline-dark" id="edit_delete" onclick=comment_delete(${element.id})>delete</button>
            `      
        })
        comment_list.innerHTML = output
  // }
    
}

async function get_comment(page_param){
    if(page_param==''){
        const response = await fetch(`${main_url}/article/${article_id}/comment/`,{
            headers : {
                "Authorization": "Bearer" + localStorage.getItem("access"),
                "content-type": "application/json"
            },
            method : 'GET',
        })
        response_json = await response.json()
        console.log(response_json)
        
        var my_comment = new Array
        response_json.results.forEach(element =>{
            if(element.user == userId){
                my_comment.push(element)
            }
        })
        return my_comment
    }
    else{
        page = page_param.split('=')[1]
        const response = await fetch(`${main_url}/article/${article_id}/comment/?page=${page}`,{
            headers:{
                "Authorization":"Bearer" + localStorage.getItem("access"),
                "content-type": "application/json"
            },
            method:'GET',
        })
        response_json = await response.json()
        console.log(response_json)

        var my_comment = new Array
        response_json.results.forEach(element =>{
            if(element.user == userId){
                my_comment.push(element)
            }
        })
        return my_comment
    }
}

async function load_comments(){
    page_param = location.search
    var page = parseInt(page_param.split('=')[1])

    myComment_list = await get_comment(page_param)
    
    let total_comments = myComment_list.count
    let page_count = Math.ceil(total_comments / 3)

    if(page_param == ""){
        current_page = 1
    }
    else{
        current_page = page
    }

    let page_group = Math.ceil(current_page / 5)
    let last_number = page_group * 5

    if(last_number > page_count){
        last_number = page_count
    }
    let first_number = last_number - (5-1)
    
    const next = current_page + 1
    const prev = current_page - 1
    let pagination_box = document.getElementById('pagination_box')
    let page_btn = '<ul class="pagination">'

    if(myComment_list.previous != null){
        page_btn += `<li class="page-item" ><a class="page-link" href="article_detail.html?page=${prev}">Prev</a></li>`
    }

    if(page_count >= 5){
        for(let i=first_number; i<= last_number; i++ ){
            if(i == current_page){
                page_btn += `<li class="page-item active" aria-current="page"><a class="page-link"href="article_detail.html?page=${i}">${i}</a></li>`
            } else {
    
            page_btn += `<li class="page-item" ><a class="page-link" href="article_detail.html?page=${i}">${i}</a></li>`
        }}
    }else{
        for(let i = 1; i<=page_count;i++){
            if(i== current_page){
                page_btn += `<li class="page-item active" aria-current="page"><a class="page-link"href="article_detail.html?page=${i}">${i}</a></li>`
            }else{
                page_btn += `<li class="page-item" ><a class="page-link" href="article_datail.html?page=${i}">${i}</a></li>`
            }
        }}
        
    if (response_json.next != null){
        page_btn += `
        <li class="page-item" ><a class="page-link" href="article_detail.html?page=${next}">Next</a></li>
        `
    }
    page_btn += '</ul>'
    
    pagination_box.innerHTML = page_btn
    
  
    const comment_list = document.getElementById('comment_list')
    let output = ''
    response_json.comment_set.reverse().forEach(element => {
        if(userId != output){
            output +=``
        }
        output += `
        <input class="form-control" type="text" value="${element.content}" readonly>            
        <button type="button" class="btn btn-outline-dark" id="edit_comment_btn" onclick=save_comment_id(${element.id}) data-bs-toggle="modal" data-bs-target="#comment_edit_modal">edit comment</button>
        <button type="button" class="btn btn-outline-dark" id="edit_delete" onclick=comment_delete(${element.id})>delete</button>`      
        })
    comment_list.innerHTML = output

}
function article_delete() {
    const response = fetch(`${main_url}/article/${article_id}/detail/`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem('access'),
            "content-type": "application/json"
        },
        method: "DELETE"
    })
    window.location.replace('articles.html')
}

function article_edit() {
    const mbti = document.getElementById('input_mbti')
    const mbti_txt = mbti.options[mbti.selectedIndex].text
    const category = document.getElementById('input_category')
    const category_txt = category.options[category.selectedIndex].text
    const worry = document.getElementById('input_worry').value

    const response = fetch(`${main_url}/article/${article_id}/detail/`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem('access'),
            "content-type": "application/json"
        },
        method: "PUT",
        body: JSON.stringify({
            "mbti":mbti_txt,
            "category":category_txt,
            "content":worry
        })
    })
    window.location.reload()
}

function comment_create(){
  
    const inputItem = document.getElementById('comment_input').value
    const response = fetch(`${main_url}/article/${article_id}/comment/`,{
        headers:{
            "Authorization": "Bearer " + localStorage.getItem('access'),
            "content-type": "application/json"
        },
        method: "POST",
        body : JSON.stringify({
            "content":inputItem
        })
    })
    
    window.location.reload()
}

function comment_delete(comment_id){

    const response = fetch(`${main_url}/article/${article_id}/comment/${comment_id}/`,{
        headers : {
            'Authorization' : 'Bearer ' + localStorage.getItem('access'),
            'content-type' : 'application/json',
        },    
        method : 'DELETE',
        body : {}
    })
    window.location.replace('article_detail.html')
    window.console.log('delete')
}

function comment_edit(){ 
    const comment_edit_input = document.getElementById('comment_edit_input').value
    const get_comment_id = localStorage.getItem("comment_id")
    const response = fetch(`${main_url}/article/${article_id}/comment/${get_comment_id}/`,{
        headers : {
            'Authorization' : 'Bearer ' + localStorage.getItem('access'),
            'content-type' : 'application/json',
        },    
        method : 'PUT',
        body : JSON.stringify({
            "content": comment_edit_input
        })
    })
    window.location.replace('article_detail.html')
}

function handleLogout(){
    localStorage.clear()
    window.location.replace("api.html")
}

function save_comment_id(comment_id){
    localStorage.setItem('comment_id',comment_id)    
}